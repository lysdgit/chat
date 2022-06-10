
new Vue({
    el: "#app",
    data() {
        return {
            isShow: true,
            username: '',//当前用户名
            userSystem: [],//存储当前用户的状态和消息数组
            nowDate: new Date().toTimeString().substr(0, 8),//当前时间
            userInfo: [],//当前用户信息
            msgVal: '',//消息内容
            color: '#000000',//字体颜色
            isEmojiShow: false,//表情默认隐藏
            emojis: [],//存放表情的数组
            isShake:false,
            timer:null,
        }
    },
    methods: {
        // 单击笑脸的事件
        handleSelectEmoji() {
            this.isEmojiShow = true;
        },
        // 双击笑脸取消事件
        handleDoubleSelectEmoji() {
            this.isEmojiShow = false;
        },
        handleEmoji(i) {
            //处理单击表情的事件
            this.isEmojiShow = false;
            this.msgVal = this.msgVal + `[emoji${i}]`
        },
        // 点击确定按钮
        handleClick() {
            const imgN = Math.floor(Math.random() * 12) + 1; //随机分配 1 2 3 4
            if (this.username) {
                this.socket.emit('login', {
                    username: this.username,
                    imgSrc: `image/user${imgN}.jpg`
                })
            }
        },
        handleSendMsg(e) {
            // 发送消息的事件  vue 事件修饰符
            e.preventDefault();
            if (this.msgVal) {
                this.socket.emit('sendMsg', {
                    msgVal: this.msgVal,
                    color: this.color
                    // 颜色 
                })
                this.msgVal = '';
            }
        },
        handleCloseMsg(e) {
            // 点击关闭按钮操作
            e.preventDefault();
            this.isEmojiShow = false;
            this.msgVal = '';
        },
        initEmoji() {
            for (let i = 1; i <= 141; i++) {
                this.emojis.push(`image/emoji/emoji (${i}).png`)
            }
        },
        scrollBottom(){
            // 在DOM渲染完成之后，执行内部的回调
            this.$nextTick(()=>{
                const oDiv = document.getElementById('messages');
                oDiv.scrollTop = oDiv.scrollHeight;
            })
        },
        handleShake(){
            // 震动的方法
            this.socket.emit('shake');
        },
        shake(){
            //震动的方法
            this.isShake = true;
            clearTimeout(this.timer);
            this.timer = setTimeout(() => {
                this.isShake = false;
            }, 500);
        }


    },
    created() {
        // 初始化渲染表情
        this.initEmoji();

        const socket = io();
        this.socket = socket;
        this.socket.on('loginSuc', () => {
            console.log('登录成功了');
            this.isShow = false;
        })
        this.socket.on('loginError', () => {
            alert('用户名重复，请重新输入');
            this.username = '';
        })
        this.socket.on('system', (user) => {
            // {name:"XXX",status:'进入'}

            this.userSystem.push(user);
            this.scrollBottom();
        })
        this.socket.on('disUser', (userInfo) => {
            this.userInfo = userInfo;
        })
        this.socket.on('receiveMsg', (user) => {
            let { msg } = user;
            let content = '';

            while (msg.indexOf('[') > -1) {
                // 有表情渲染
                const start = msg.indexOf('[');
                const end = msg.indexOf(']');
                content += `<span>${msg.substr(0, start)}</span>`;
                content += `<img src="image/emoji/emoji%20(${msg.substr(start + 6, end - start - 6)}).png" alt=""/>`
                msg = msg.substr(end + 1, msg.length);
            }
            content += `<span>${msg}</span>`
            user.msg = content;
            
            // 颜色展示
            // 表情渲染
            // 保证滚动条总是在最底部
            this.userSystem.push(user);

            // 保证滚动条始终在下面
            this.scrollBottom();
        })

        // 监听震动事件
        this.socket.on('shake',(data)=>{
            this.userSystem.push(data);
            // 处理页面震动的操作
            this.shake();
            // 滚动条滚动到最底部
            this.scrollBottom();
        })

    }
})