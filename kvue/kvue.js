class Kvue {
    constructor(options) {
        this.$options = options;
        this.$data = $options.data;
        observe(this.$data);//data 响应式处理
        Proxy(this);//代理options.data中的数据到实例下,实现app.xxx 直接调用
        new Compile(options.ele,this);//编译模板
    }
}
//遍历参数对象，对其所有属性添加响应式
function observe(obj){
    if(typeof obj !== 'object' || obj === null){
        return;
    }

    new Observe(obj);
}

// 根据传入value的类型做相应的响应式处理 ,这里暂时只处理对象形式
class Observe{
    constructor(value){
        this.value = value;
        if(Array.isArray(value)){//如果是数组类型
            //todo
        }else{
            Object.keys(value).forEach((key)=>{
                defineReactive(value,key,value[key]);
            });
        }
    }

}

function defineReactive(obj,key,value){
    //首先递归一下，防止value 还是对象
    observe(value);

    // 创建管家dep 实例
    const dep = new dep();

    Object.defineProperty(obj,key,{
        get (){
            console.log('get',value);
            //收集依赖
            Dep.target && dep.addDep(Dep.target);
            return value;
        },
        set (newValue){
            if(value !== newValue){
                //如果newValue 是对象，需要在进行响应式
                observe(newValue);
                value = newValue;
                dep.notify();
            }
        }
    })
}


class Dep {
    constructor(){
        this.deps = [];
    }
    addDep(dep){
        this.deps.push(dep);
    }
    notify(){
        this.deps.forEach((dep)=>{
            dep.update();
        })
    }
}

//为了实现吧app.$data.xxx 变成 app.xx 可以直接调用
function proxy(vm){
    Object.keys(vm.$data).forEach(key => {
        Object.defineProperty(vm,key,{
            get (){
                return vm.$data[key];
            },
            set (v){
                vm.$data[key] = v;
            }
        });
    });
}

class Compile{
    constructor(el,vm){
        this.$el = document.querySelector(el);
        this.$vm = vm;
        if(this.$el){
            this.compile(this.$el);
        }
    }
    compile(el){
        //遍历元素的子节点，根据不同的节点类型做相应的处理
        const childNodes = el.childNodes;
        childNodes.forEach(node =>{
            if(node.nodeType === 1){//如果是元素节点
                const attrs = node.attributes;
                Array.from(attrs).forEach((attr) => {
                    const attrName = attr.name;
                    const exp = attr.value;
                    if(atrrName.startWith('k-')){
                        const dir = attrName.subString(2);
                        this[dir] && this[dir](node,exp);//看data中是否有对应数据或者方法
                    }
                })
            }else if(this.isInter(node)){
                this.update(node,RegExp.$1,'text');//处理插值{{xx}}
            }
        });
        // 递归
      if(node.childNodes) {
        this.compile(node);
      }
    }
    isInter(node){
        return node.nodeType === '3' && /\{\{(.*)\}\}/.test(node.textContent);//自动捕获分组的数据到RegExp对象上，可以用RegExp.$xx 来获取
    }
    
    update(node,exp,dir){//提取update方法，exp 是属性值 ，dir是属性key
        // 初始化
        const fn = this[dir + 'updater'];
        fn && fn(node,this.$vm[exp]);
        // 更新、监视变化
        new Watcher(this.$vm,exp,function(val){
            fn && fn(val);
        })
    }
    // k-text
    text(node, exp) {
        this.update(node, exp, 'text');
    }
    textUpdater(node,val){
        node.textContent = val;
    }
    // k-html
    html(node, exp) {
        this.update(node, exp, 'html');
    }
    htmlUpdater(node, value) {
        node.innerHTML = value
    }
    //more...
}

// 监听器： 负责依赖更新
class Watcher{
    constructor(vm,key,updateFn){
        this.vm = vm;
        this.key = key;
        this.updateFn = updateFn;

        // 触发依赖收集
        Dep.target = this;//每个watcher
        this.vm[this.key];//主动触发一次
        Dep.target = null;
    }
    // 未来被dep调用
    update(){
        // 执行实际更新操作
        this.updateFn.call(this.vm,this.vm[this.key]);
    }
}