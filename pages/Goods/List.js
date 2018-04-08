var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
      inputShowed: false,
      inputVal: "",
      goodsList:[],
      tabs: [],
      cat_id: '',
	  goodsTplName:'goods_show_2',
	  listTypeIconName:'list_type_icon_1.png',
  },
	changIcon:function(){
		console.log(this.data.goodsTplName);
		if (this.data.goodsTplName =='goods_show_2') {
			this.setData({
				goodsTplName:'goods_show_1',
				listTypeIconName: 'list_type_icon_2.png',
			})
		}else if(this.data.goodsTplName == 'goods_show_1') {
			this.setData({
				goodsTplName: 'goods_show_2',
				listTypeIconName: 'list_type_icon_1.png',
			})
		}
	},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      var that = this;
      if (options.search_value) {
          that.setData({
            inputVal: options.search_value,
            inputShowed:true
        });
      }
      if (options.cat_id) {
          that.setData({
              cat_id: options.cat_id
          });
          
      }
      app.getLogin(function () {
          that.init(); 
      })
     
  },
  init: function () {
      this.getCat();
      this.getList();
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
      this.init(); 
      wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
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
  getList: function (){
      var that = this;
      wx.request({
          url: app.globalData.apiDomain + '/Goods/getList',
          data: {
              user_key: app.globalData.user_key,
              supplier_key: app.globalData.supplier_key,
              search_value: that.data.inputVal,
              cat_id: that.data.cat_id
          },
          method: 'POST',
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          success: function (res) {
              var data = res.data;
              
                  that.setData({
                      goodsList: data.info
                  })
              
          }
      })
    },
    tabClick: function (e) {
      this.setData({
          sliderOffset: e.currentTarget.offsetLeft,
          cat_id: e.currentTarget.dataset.cat_id
      });
      this.getList();
  },
    getCat:function () {
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