var app = getApp();
var util = require('../../utils/util.js');
Page({
    data: {
        carts: [],  //购物车数据
        count: 0,
        goods_amount: 0,
        choose_all: 1,
        minusStatuses: ['disabled', 'disabled', 'normal', 'normal', 'disabled'],
        startX: 0, //开始坐标
        startY: 0,
        // input默认是1
        num: 1,
        // 使用data数据对象设置样式名
        minusStatus: 'disabled'
    },
	onLoad:function(option){
	},
    onShow: function () {
		this.init();
    },
	init:function(){
		var that = this;
		app.getLogin(function () {
			that.getItems();
		});
	},
    getItems: function () {
        var that = this;
        wx.request({
			url: app.globalData.apiDomain + '/Cart/getList/',
            data: {
                user_key: app.globalData.user_key,
                supplier_key: app.globalData.supplier_key
            },
            method: 'POST',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            success: function (res) {
                var data = res.data;
                if (data.status == 0) {
                    that.handle(data.info.list);
                }
            }
        });
    },
    //手指触摸动作开始 记录起点X坐标
    touchstart: function (e) {
        //开始触摸时 重置所有删除
        this.data.carts.forEach(function (v, i) {
            if (v.isTouchMove)//只操作为true的
                v.isTouchMove = false;
        })
        // console.log(e.changedTouches[0]);
        this.setData({
            startX: e.changedTouches[0].clientX,
            startY: e.changedTouches[0].clientY,
            carts: this.data.carts
        })
    },
    //滑动事件处理
    touchmove: function (e) {
        var that = this,
            index = e.currentTarget.dataset.index,//当前索引
            startX = that.data.startX,//开始X坐标
            startY = that.data.startY,//开始Y坐标
            touchMoveX = e.changedTouches[0].clientX,//滑动变化坐标
            touchMoveY = e.changedTouches[0].clientY,//滑动变化坐标
            //获取滑动角度
            angle = that.angle({ X: startX, Y: startY }, { X: touchMoveX, Y: touchMoveY });
        that.data.carts.forEach(function (v, i) {
            v.isTouchMove = false
            //滑动超过30度角 return
            if (Math.abs(angle) > 30) return;
            if (i == index) {
                if (touchMoveX > startX) //右滑
                    v.isTouchMove = false
                else //左滑
                    v.isTouchMove = true
            }
        })
        //更新数据
        that.setData({
            carts: that.data.carts
        })
    },
    /**
     * 计算滑动角度
     * @param {Object} start 起点坐标
     * @param {Object} end 终点坐标
     */
    angle: function (start, end) {
        var _X = end.X - start.X,
            _Y = end.Y - start.Y
        //返回角度 /Math.atan()返回数字的反正切值
        return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
    },
    //删除事件
    del: function (e) {
        var that = this;
        var index = e.currentTarget.dataset.index;
        var cart_id = this.data.carts[index].cart_id;
        app.getLogin(function () {
            that.delteCart(cart_id, function(res){
                if (res.status == 0) {
                    that.data.carts.splice(index, 1);
                    console.log(that.data.carts);
                    that.handle(that.data.carts);
                } else {
                    wx.showToast({
                        title: res.info,
                        icon: 'fail',
                        duration: 1500
                    });
                }
            });
        });
    },
    /* 点击减号 */
    bindMinus: function (e) {
        var that = this;
        var carts = that.data.carts;
        var index = parseInt(e.currentTarget.dataset.index);
        carts[index].goods_num--;
        app.getLogin(function () {
            that.updateCart(carts[index], function (res) {
                if (res.status == 0) {
                    if (carts[index].goods_num <= 0) {
                        var newCarts = carts.filter(function (item, key) {
                            return key != index;
                        });
                        carts = newCarts;
                    }
                    that.handle(carts);
                } else {
                    wx.showToast({
                        title: res.info,
                        icon: 'fail',
                        duration: 1500
                    });
                }
            });
        })
    },
    /* 点击加号 */
    bindPlus: function (e) {
        var that = this;
        var carts = that.data.carts;
        var index = parseInt(e.currentTarget.dataset.index);
        carts[index].goods_num++;
        if (carts[index].goods_num > carts[index].goods_stock) {
            wx.showToast({
                title: '库存不足',
                icon: 'fail',
                duration: 1500
            });
            return false;
        }
        app.getLogin(function () {
            that.updateCart(carts[index], function (res) {
                if (res.status == 0) {
                    that.handle(carts);
                } else {
                    wx.showToast({
                        title: res.info,
                        icon: 'fail',
                        duration: 1500
                    });
                }
            });
        })
    },
    /* 输入框事件 */
    bindManual: function (e) {
        var num = e.detail.value;
        // 将数值与状态写回
        this.setData({
            num: num
        });
    },
    //修改购物车
    updateCart: function (params, callback) {
        var url = app.globalData.apiDomain + '/Cart/update/';
        //var url = 'http://127.0.0.1/chartShop/Api/Cart/update/';
        wx.request({
            url: url,
            data: {
                user_key: app.globalData.user_key,
                supplier_key: app.globalData.supplier_key,
                cart_id: params.cart_id,
                buy_number: params.goods_num
            },
            header: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            method: 'POST',
            success: function (res) {
                var data = res.data;
                callback(data);
            }
        })
    },
    //修改购物车
    delteCart: function (cart_id, callback) {
        var url = app.globalData.apiDomain + '/Cart/delete/';
        //var url = 'http://127.0.0.1/chartShop/Api/Cart/delete/';
        wx.request({
            url: url,
            data: {
                user_key: app.globalData.user_key,
                supplier_key: app.globalData.supplier_key,
                cart_id: cart_id,
            },
            header: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            method: 'POST',
            success: function (res) {
                var data = res.data;
                callback(data);
            }
        })
    },
    //选中
    chooseAll: function (e) {
        var that = this;
        var carts = that.data.carts;
        app.getLogin(function () {
            //var url = 'http://127.0.0.1/chartShop/Api/Cart/choose/';
			var url = app.globalData.apiDomain + '/Cart/choose/';
            wx.request({
                url: url,
                data: {
                    user_key: app.globalData.user_key,
                    supplier_key: app.globalData.supplier_key,
                    cart_id: 0,
                    choose: that.data.choose_all
                },
                header: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                method: 'POST',
                success: function (res) {
                    var data = res.data;
                    if (data.status == 0) {
                        for (var i = 0; i < carts.length; i++) {
                            carts[i].choose = data.info;
                        }
                        that.handle(carts);
                    }
                }
            })
        });
    },
    //选中
    choose: function (e) {
        var that = this;
        var index = parseInt(e.currentTarget.dataset.index);
        var carts = that.data.carts;
        app.getLogin(function () {
            //var url = 'http://127.0.0.1/chartShop/Api/Cart/choose/';
			var url = app.globalData.apiDomain + '/Cart/choose/';
            wx.request({
                url: url,
                data: {
                    user_key: app.globalData.user_key,
                    supplier_key: app.globalData.supplier_key,
                    cart_id: carts[index].cart_id
                },
                header: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                method: 'POST',
                success: function (res) {
                    var data = res.data;
                    if (data.status == 0) {
                        carts[index].choose = data.info;
                        that.handle(carts);
                    }
                }
            })
        });
    },
    //结果处理
    handle: function (data) {
        var count = 0;
        var choose_all = 0;
        var goods_amount = 0;
        for (var i = 0; i < data.length; i++) {
            data[i].isTouchMove = false;
            if (data[i].choose == 1) {
                count++;
                goods_amount = goods_amount + data[i].goods_price * data[i].goods_num
            }
        }

        if (count == data.length) {
            choose_all = 1;
        }
        this.setData({
            carts: data,
            count: count,
            choose_all: choose_all,
            goods_amount: goods_amount
        });
    },
    //结算
    balance: function () {
        if (this.data.count <= 0) {
            wx.showToast({
                title: '请选择商品',
                icon: 'fail',
                duration: 1500
            });
            return false;
        }
        wx.navigateTo({
            url: '../Order/Confirm'
        })
    }
})