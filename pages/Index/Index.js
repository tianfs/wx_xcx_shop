// pages/home/home.js
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    inputShowed: false,
    inputVal: "",
    tabs: [],
    imgUrls: [],
	goodsTplName:'goods_show_1',
    programs:[],
    //homeTile:'推荐商品'
  },
  onLoad: function (options) {
      // 页面初始化 options为页面跳转所带来的参数
      var that = this;
          that.init();
  },
  init:function(){
      var that = this;
	  app.getLogin(function () {
		  that.setData({
			  goodsTplName: 'goods_show_' + app.globalData.supplier_info.goods_show_type,
			  //homeTile: app.globalData.supplier_info.home_title
		  })
		  wx.setNavigationBarTitle({
			  title: app.globalData.supplier_info.supplier_name,
		  })
		  that.getCat();
		  that.getGeneral();
		  that.getPrograms();
		  
	  })  
  },
  showInput: function () {
    this.setData({
      inputShowed: true
    });
  },
  hideInput: function () {
    this.setData({
      inputVal: "",
      inputShowed: false
    });
  },
  clearInput: function () {
    this.setData({
      inputVal: ""
    });
  },
  inputTyping: function (e) {
    this.setData({
      inputVal: e.detail.value
    });
  },
  toList:function(e){
    var url = "../Goods/List?search_value=" + this.data.inputVal;
    wx.navigateTo({
        url: url,
    })
  },
  getCat:function(){
      var that = this;
      wx.request({
          url: app.globalData.apiDomain + '/Category/getList',
          data: {
              user_key: app.globalData.user_key,
              supplier_key: app.globalData.supplier_key,
          },
          method: 'POST',
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          success: function (res) {
              var data = res.data;
              that.setData({
                  tabs: data.info
              })
          }
      })
   },
  getGeneral:function(){
      //获取焦点图
      var that = this;
      wx.request({
          url: app.globalData.apiDomain + '/General/getList',
          data: {
              user_key: app.globalData.user_key,
              supplier_key: app.globalData.supplier_key,
              general_key:'index_swiper_img'
          },
          method: 'POST',
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          success: function (res) {
              var data = res.data;
              that.setData({
                  imgUrls: data.info
              })
          }
      })
    },
   getPrograms: function () {
        //获取焦点图
        var that = this;
        wx.request({
            url: app.globalData.apiDomain + '/Program/getPrograms',
            data: {
                user_key: app.globalData.user_key,
                supplier_key: app.globalData.supplier_key
            },
            method: 'POST',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            success: function (res) {
                var data = res.data;
                that.setData({
                    programs: data.info
                })
            }
        })
    },
   jumpInfo:function(e){
        wx.navigateTo({
            url: '../Goods/Detail?goods_id=' + e.currentTarget.dataset.goods_id,
        })
   },
   /**
	* 用户点击右上角分享
	*/
   onShareAppMessage: function () {
	   return {
		   title: app.globalData.supplier_info.supplier_name,
		   desc: '',
		   path: '/pages/Index/Index'
	   }
   }
})