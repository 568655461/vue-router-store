// 数据响应式
// 包含有虚拟dom的vue源码实现
function defineReactive(obj, key, val) {
  // 递归
  observe(val);

  // 创建Dep实例
  const dep = new Dep()
  
  Object.defineProperty(obj, key, {
    get() {
      console.log("get", key);
      // 依赖收集
      Dep.target && dep.addDep(Dep.target)
      return val;
    },
    set(newVal) {
      if (newVal !== val) {
        console.log("set", key);
        // 保证如果newVal是对象，再次做响应式处理
        observe(newVal);
        val = newVal;

        dep.notify()
      }
    },
  });
}

// 遍历obj，对其所有属性做响应式
function observe(obj) {
  if (typeof obj !== "object" || obj === null) {
    return;
  }

  new Observer(obj);
}

// 根据传入value的类型做相应的响应式处理
class Observer {
  constructor(value) {
    this.value = value;

    if (Array.isArray(value)) {
      // todo
    } else {
      this.walk(value);
    }
  }

  // 对象响应式
  walk(obj) {
    Object.keys(obj).forEach((key) => {
      defineReactive(obj, key, obj[key]);
    });
  }
}

function proxy(vm) {//为了实现吧app.$data.xxx 变成 app.xx 可以直接调用
  Object.keys(vm.$data).forEach(key => {
    Object.defineProperty(vm, key, {
      get() {
        return vm.$data[key]
      },
      set(v) {
        vm.$data[key] = v
      }
    })
  })
}

// KVue
// 1.对data选项做响应式处理
// 2.编译模板
class KVue {
  constructor(options) {
    this.$options = options;
    this.$data = options.data;

    // data响应式处理
    observe(this.$data);

    // 代理
    proxy(this)

    // compile
    // new Compile(options.el, this)
    if(options.el){
      this.$mount(options.el)
    }
  }
  $mount(el){
    this.$el = document.querySelector(el);
    const updateComponet = () => {
      const {render}  =  this.options;
      const vnode = render.call(this,this.$createElement);
      this._update(vnode);
      // const parent = this.$el.parentElement;
      // parent.insertBefore(el,this.$el.nextSibling);
      // parent.removeChild(this.$el);
      // this.$el = el;
    }

    new Watcher(this,updateComponet)
  }

  $createElement(tag,props,children){
    return {tag,props,children}
  }

  _update(vnode){
    const prevVnode = this._vnode;
    if(!prevNode){
      //初始化
      this.__patch__(this.$el,vnode);
    }else{
      this.__patch__(prevVnode,vnode);
    }
  }

  __patch__(oldVnode,vnode){
    if(oldVnode.nodeType){//真实节点
      const parent = oldVnode.parentElement;
      const refEle = oldVnode.nextSibling;
      const el = this.createEle(vnode);
      parent.insertBefore(el,refEle);
      parent.removeChild(oldVnode);
      this._vnode  = vnode;
    }else{
      //update
      const el = vnode.el = oldVnode.el;
      if(oldVnode.tag === vnode.tag){
        const oldProps = oldVnode.props || {};
        const newProps = vnode.props || {};
        for (const key in newProps) {
          const oldValue  = oldProps[key];
          const newValue  = newProps[key];
          if(oldValue !== newValue){
            el.setAttribute(key,newValue)
          }
        }

        for( const key in oldProps){
          if(!(key in newProps)){
            el.removeAttribute(key);
          }
        }

        const oldCh = oldVnode.children;
        const newCh = vnode.children;
        if(typeof newCh === 'string'){
          if(typeof oldCh  ===  'string'){
            if(oldCh !== newCh){
              //新旧文本不同
              el.textContent = newCh;
            }
          }else{
            //之前没文本
            el.textContent = newCh;
          }
        }else{
          if(typeof oldCh === 'string'){
            el.innerHTML = '';
            newCh.forEach(child => this.createEle(child))
          } else {
            this.updateChildren(el,oldCh,newCh)
          }
        }
      }
    }
  }

  createEle(vnode){
    const el  = document.createElement(vnode.tag);
    if(vnode.props){
      for (const key in vnode.props) {
        const value = vnodee.props[key];
        el.setAttribute(key,value)
      }
    }
    if(vnode.children){
      if(typeof vnode.children === 'string'){
        el.textContent  =  vnode.children;
      }else{
        // 数据递归
        vnode.children.forEach(n => {
          const child  = this.createEle(n);
          el.appendChild(child);
        })
      }
    }
    vnode.el = el;
    return el;
  }

  updateChildren(parentEle,oldCh,newCh){
    const len  = Math.min(oldCh.length,newCh.length);
    for(let i=0 ;i < len;i++){
      this.__patch__(oldCh[i],newCh[i])
    }

    if(newCh.length > oldCh.length){
      newCh.slice(len).forEach(child => {
        const el = this.createEle(child);
        parentEle.appendChild(el);
      })
    } else if(newCh.length < oldCh.length){
      oldCh.slice(len).forEach(child => {
        const el = this.createEle(child);
        parentEle.removeChild(el);
      })
    }
  }
}

// 解析模板
// 1.处理插值
// 2.处理指令和事件
// 3.以上两者初始化和更新
class Compile {
  constructor(el, vm) {
    this.$vm = vm
    this.$el = document.querySelector(el)

    if (this.$el) {
      this.compile(this.$el)
    }
  }

  compile(el) {
    
    const childNodes = el.childNodes

    childNodes.forEach(node => {
      if (node.nodeType === 1) {
        // 元素
        // console.log('元素', node.nodeName);
        // 处理指令和事件
        const attrs = node.attributes
        Array.from(attrs).forEach(attr => {
          // k-xxx="abc"
          const attrName = attr.name
          const exp = attr.value
          if (attrName.startsWith('k-')) {
            const dir = attrName.substring(2)
            this[dir] && this[dir](node, exp)
          }
        })
      } else if (this.isInter(node)) {
        // 文本
        // console.log('插值', node.textContent);
        this.compileText(node)
      }

      // 递归
      if(node.childNodes) {
        this.compile(node)
      }
    })
  }

  update(node, exp, dir) {
    // 1.初始化
    const fn = this[dir + 'Updater']
    fn && fn(node, this.$vm[exp])

    // 2.更新
    new Watcher(this.$vm, exp, function(val) {
      fn && fn(node, val)
    })
  }
  
  // k-text
  text(node, exp) {
    this.update(node, exp, 'text')
  }

  textUpdater(node, value) {
    node.textContent = value
  }
  
  // 编译文本 {{xxx}}
  compileText(node) {
    this.update(node, RegExp.$1, 'text')
  }

  html(node, exp) {
    this.update(node, exp, 'html')
  }
  
  htmlUpdater(node, value) {
    node.innerHTML = value
  }
  
  // 是否插值表达式
  isInter(node) {
    return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)
  }
}

// 监听器： 负责依赖更新
class Watcher {
  constructor(vm, updateFn) {
    this.vm = vm;
    this.getter = updateFn;
    this.get();
  }

  get (){
    // 触发依赖收集
    Dep.target = this;
    this.getter.call(this,vm);
    Dep.target = null
  }

  // 未来被Dep调用
  update() {
    this.get()
  }
}

class Dep {
  constructor() {
    this.deps = new Set();
  }

  addDep(watcher) {
    this.deps.add(watcher)
  }

  notify() {
    this.deps.forEach(dep => dep.update())
  }
}