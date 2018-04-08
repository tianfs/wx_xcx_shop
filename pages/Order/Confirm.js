var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    cart_data: [],  //购物车数据
    list: [],   //商品列表
    total_goods_num: 0, //商品总数
    freight: 0, //运费
    total_amount : 0,   //订单总价
    address: [], //收货地址,
    leave_msg: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      app.globalData.df_addr_id = '';
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
      this.init();
  },
  init:function(){
	  var that = this;
	  app.getLogin(function () {
		  that.getList();
	  });
  },
  getList: function() {
      var that = this;
      wx.request({
          //url: 'http://127.0.0.1/chartShop/Api/Cart/getList/',
          url: app.globalData.apiDomain + '/Cart/getList/',
          data: {
              user_key: app.globalData.user_key,
              supplier_key: app.globalData.supplier_key,
              addr_id: app.globalData.df_addr_id,
              choose:1
          },
          method: 'POST',
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          success: function (res) {
                var data = res.data;
                if (data.status == 0) {
                    if (app.globalData.df_addr_id == '' && data.info.address)                 {
                        app.globalData.df_addr_id = data.info.address.addr_id;
                    }
                    that.setData({
                        list: data.info.list,
                        address: data.info.address,
                        freight: data.info.freight,
                        total_goods_num: data.info.total_goods_num,
                        total_amount: data.info.total_amount
                    });
                }
          }
      });
  },
  //留言
  input_leave_msg: function(event) {
      this.setData({
          leave_msg: event.detail.value
      })
  },
  //下单
  submit: function() {
      var that = this;
      var data = {
          user_key: app.globalData.user_key,
          supplier_key: app.globalData.supplier_key,
          addr_id: app.globalData.df_addr_id,
          leave_msg: that.data.leave_msg
      }
      wx.request({
          //url: 'http://127.0.0.1/chartShop/Api/Order/createOrder/',
          url: app.globalData.apiDomain + '/Order/createOrder/',
          data: data,
          success: function (res) {
              var data = res.data;
              console.log(data.info);
              if (data.status == 0) {
                  var order_id = data.info;
                  var url = '../Order/Details?order_id=' + order_id;
                  app.pay(order_id, function (status, content){
                      wx.showModal({
                          title: '',
                          content: content,
                          showCancel: false, 
                          success: function (res) {
                              wx.redirectTo({
                                  url: url
                              });
                          }
                      });
                  });
                  return false;
              } else {
                  wx.showModal({
                      title: '',
                      content: data.info,
                      showCancel: false
                  });
              }
          }
      });
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})