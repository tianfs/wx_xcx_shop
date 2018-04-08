var app = getApp()
Page({  
  data:{
      addrId:'',
      name:'',
      tel: '',
      address:'',
      region: ['北京市', '北京市', '朝阳区'],
  },
  onLoad:function(options){
      // 页面初始化 options为页面跳转所带来的参数
      var that = this;
      app.getLogin(function () {
          that.setData({
            addrId : options.addr_id ? options.addr_id : ''
        })
          that.getAddrInfo(that.data.addrId);
      });
  },
  input_name: function (event) {
      this.setData({
          name: event.detail.value
      })
  },
  input_tel: function (event) {
      this.setData({
          tel: event.detail.value
      })
  },
  input_address: function (event) {
      this.setData({
          address: event.detail.value
      })
  },
  bindRegionChange: function (e) {
      this.setData({
          region: e.detail.value
      })
  },
  getAddrInfo:function(addrId){
      if ( ! addrId) {
          return false;
      }
      var that = this;
      wx.request({
          url: app.globalData.apiDomain + '/Address/getInfo',
          data: {
              user_key: app.globalData.user_key,
              supplier_key: app.globalData.supplier_key,
              addr_id: addrId
          },
          method: 'POST',
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          success: function (res) {
              var data = res.data;
              if (data.status == 0) {
                  that.setData({
                      name: data.info.name,
                      tel: data.info.tel,
                      address: data.info.address,
                      region: [data.info.province, data.info.city, data.info.district]
                  })
                  
              }
          }
      })
  },
  saveAddr:function(event){
      var that = this;
      wx.request({
          url: app.globalData.apiDomain + '/Address/saveAddr',
          data: {
              user_key: app.globalData.user_key,
              supplier_key: app.globalData.supplier_key,
              addr_id: that.data.addrId,
              name: that.data.name,
              tel: that.data.tel,
              address: that.data.address,
              province: that.data.region[0], 
              city: that.data.region[1], 
              district: that.data.region[2]             
          },         
          method: 'POST',
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          success: function (res) {
              var data = res.data;
              if (data.status == 0) {
                  wx.showToast({
                      title: '成功',
                      icon: 'success',
                      duration: 1500,
                      success:function(){
                          wx.navigateBack({
                              delta: 1
                          })
                      }
                  })
              } else {
				  wx.showModal({
					  content: data.info,
					  showCancel: false
				  });
			  }
          }
      })
  },
    openWxAddr:function () {
        var that = this;
        wx.chooseAddress({
            success: function (res) {
                that.setData({
                name: res.userName,
                tel: res.telNumber,
                region: [res.provinceName, res.cityName, res.countyName],
                address:res.detailInfo
                })
            }
        })
    },
    delAddr:function(){
        if (!this.data.addrId) {
            return false;
        }
        var that = this;
        wx.request({
            url: app.globalData.apiDomain + '/Address/delAddr',
            data: {
                user_key: app.globalData.user_key,
                supplier_key: app.globalData.supplier_key,
                addr_id: that.data.addrId
            },
            method: 'POST',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            success: function (res) {
                var data = res.data;
                if (data.status == 0) {
                    wx.showToast({
                        title: '成功',
                        icon: 'success',
                        duration: 1500,
                        success: function () {
                            wx.navigateBack({
                                delta: 1
                            })
                        }
                    })


                }
            }
        })
    }
})