var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    addrs:[],
    is_callback:false,
    default_id:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
     this.setData({
         is_callback: options.is_callback ? true:false
     })
  },
  onShow: function (){
     this.init();
  },
  init:function(){
	  var that = this;
	  app.getLogin(function () {
		  that.getList();
	  })
  },
  closeBack:function(e){
    if (this.data.is_callback) {
        
        app.globalData.df_addr_id=e.currentTarget.dataset.addr_id;

        wx.navigateBack({
            delta: 1
        })
    }
  },
  openSave:function(e){
      var url = "../Address/Save";
      if (e.currentTarget.dataset.addr_id) {
          url += "?addr_id=" + e.currentTarget.dataset.addr_id;
      }
      wx.navigateTo({
          url: url
      })
  },
  setDefault:function(e){
      var that = this;
      var addr_id = e.currentTarget.dataset.addr_id
      wx.request({
          url: app.globalData.apiDomain + '/Address/setDefault',
          data: {
              user_key: app.globalData.user_key,
              supplier_key: app.globalData.supplier_key,
              addr_id: addr_id
          },
          method: 'POST',
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          success: function (res) {
              var data = res.data;
              if (data.status == 0) {
                  that.setData({
                      default_id: addr_id
                  })

              }
          }
      })
  },
  getList:function(){
      var that = this;
      wx.request({
          url: app.globalData.apiDomain + '/Address/getList',
          data: {
              user_key: app.globalData.user_key,
              supplier_key: app.globalData.supplier_key
          },
          method: 'POST',
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          success: function (res) {
              var data = res.data;
              if (data.status == 0) {
                  for(var x in data.info) {
                      if (data.info[x].is_default==1) {
                          that.setData({
                              default_id: data.info[x].addr_id
                          })
                      }
                  }
                  that.setData({
                      addrs: data.info
                  })

              }
          }
      })
  }

})