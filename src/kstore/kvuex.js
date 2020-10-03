//1.插件，实现挂在$store
//2.实现store

let Vue;

class Store{
    constructor(options){
        // this.state = new Vue({
        //     data:options.state//借鸡生蛋，把数据变成响应式,实际上不会这么写，包装一下
        // })
        this._vm = new Vue({
            data:{
                $$state:options.state//不代理，私有
            }
        })
        this._mutations = options.mutations;
        this._actions = options.actions;
        this.commit = this.commit.bind(this);//绑定this
        this.dispatch = this.dispatch.bind(this);

        // this.getters = {}
    }
    
    get state(){
        return this._vm.$data.$$state;
    }
    set state(v){
        console.error('place use replaceState to reset state');//不可以直接更改state
    }

    commit(type,payload){
        const entry = this._mutations[type];
        if(!entry){
            console.error(
                'unkown mutations type'
            )
        }
        entry(this.state,payload)//传入数据
    }

    dispatch(type,payload){//异步改变数据，最终调用commit 等方法
        const entry = this._actions[type];
        if(!entry){
            console.error(
                'unkown action type'
            )
        }
        entry(this,payload)//传入对象
    }

    
}

function install(_Vue){
    Vue = _Vue;
    Vue.mixin({
        beforeCreate() {
            if(this.$options.store){
                Vue.prototype.$store = this.$options.store;
            }
        },
    })
}

export default {Store , install}