var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    goods_id: 0,
    goods: [],
    commodityAttr: [],
    attrValueList: [],
    selectedInfo:[],
    cart_count: 0,
    // input默认是1
    num: 1,
    // 使用data数据对象设置样式名
    minusStatus: 'disabled',
    is_hide: 'none',
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    userInfo: {},
    is_customer:2
  },
  /* 商品数据 */
  getDetail() {
    var _this = this;
    wx.request({
        url: app.globalData.apiDomain + '/Goods/getDeatil/', //仅为示例，并非真实的接口地址
      data: {
        user_key: app.globalData.user_key,
        supplier_key: app.globalData.supplier_key,
        goods_id: _this.data.goods_id
      },
      success: function (res) {
        var data = res.data;
        console.log(data);
        if (data.status == 0) {
          var selectedArr = new Object();
          selectedArr.goods_img = data.info.image[0];
          selectedArr.goods_price = data.info['goods_price'];
          selectedArr.goods_stock = data.info['goods_stock'];
          _this.setData({
            goods: data.info,
            commodityAttr: data.info.attr,
            includeGroup: data.info.attr,
            selectedInfo: selectedArr
          });
          wx.setNavigationBarTitle({
            title: data.info.goods_name,
          })
          _this.distachAttrValue(_this.data.commodityAttr);
          // 只有一个属性组合的时候默认选中  
          if (_this.data.commodityAttr.length == 1) {
            for (var i = 0; i < _this.data.commodityAttr[0].attrValueList.length; i++) {
              _this.data.attrValueList[i].selectedValue = _this.data.commodityAttr[0].attrValueList[i].attrvalue;
            }
            _this.setData({
              attrValueList: _this.data.attrValueList
            });
          }
          console.log(_this.data.attrValueList);
        }
      }
    })
  },
  //查询购物车数量
  getCartCount: function () {
      var that = this;
      wx.request({
          //url: 'http://127.0.0.1/chartShop/Api/Cart/getList/',
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
                  that.setData({
                      cart_count: data.info.total_goods_num
                  })
              }
          }
      });
  },
  /* 点击减号 */
  bindMinus: function () {
    var num = this.data.num;
    // 如果大于1时，才可以减
    if (num > 1) {
      num--;
    }
    // 只有大于一件的时候，才能normal状态，否则disable状态
    var minusStatus = num <= 1 ? 'disabled' : 'normal';
    // 将数值与状态写回
    this.setData({
      num: num,
      minusStatus: minusStatus
    });
  },
  /* 点击加号 */
  bindPlus: function () {
    var num = this.data.num;
    // 不作过多考虑自增1
    num++;
    // 只有大于一件的时候，才能normal状态，否则disable状态
    var minusStatus = num < 1 ? 'disabled' : 'normal';
    // 将数值与状态写回
    this.setData({
      num: num,
      minusStatus: minusStatus
    });
  },
  /* 输入框事件 */
  bindManual: function (e) {
    var num = e.detail.value;
    // 将数值与状态写回
    this.setData({
      num: num
    });
  },
  shopping: function (e) {
      var url = "../Cart/Index";
      wx.switchTab({
          url: url
      })
  },
  chooseCatalog: function (data) {
    var that = this;
    var index = parseInt(data.currentTarget.dataset.index);
    console.log(index);
    that.setData({//把选中值放入判断值
      catalogSelect: data.currentTarget.dataset.select,
      specId: data.currentTarget.dataset.select
    })
  },
  tcHide: function (e) {
    var that = this;
    that.setData({//把选中值放入判断值
      is_hide: 'none'
    })
  },
  clickTcShow: function (e) {
    var that = this;
    that.setData({//把选中值放入判断值
      is_hide: 'block'
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onLoad: function (options) {
      var that = this;
      that.data.goods_id = options.goods_id;
     // that.data.goods_id = 23;
     // that.data.goods_id = 65;
      app.getLogin(function () {
          that.setData({
              is_customer: app.globalData.supplier_info.is_customer
          })
          that.getDetail();
          that.getCartCount();
      })
  },
  /* 获取数据 */
  distachAttrValue: function (commodityAttr) {
    /** 
      将后台返回的数据组合成类似 
      { 
        attrkey:'型号', 
        attrValueList:['1','2','3'] 
      } 
    */
    // 把数据对象的数据（视图使用），写到局部内  
    var attrValueList = this.data.attrValueList;
    // 遍历获取的数据  
    for (var i = 0; i < commodityAttr.length; i++) {
      for (var j = 0; j < commodityAttr[i].attrValueList.length; j++) {
        var attrIndex = this.getAttrIndex(commodityAttr[i].attrValueList[j].attrkey, attrValueList);

        //console.log('attrValueList', attrValueList);
        // 如果还没有属性索引为-1，此时新增属性并设置属性值数组的第一个值；索引大于等于0，表示已存在的属性名的位置  
        if (attrIndex >= 0) {
          // 如果属性值数组中没有该值，push新值；否则不处理  
          if (!this.isValueExist(commodityAttr[i].attrValueList[j].attrvalue, attrValueList[attrIndex].attrValues)) {
            attrValueList[attrIndex].attrValues.push(commodityAttr[i].attrValueList[j].attrvalue);
          }
        } else {
          attrValueList.push({
            attrkey: commodityAttr[i].attrValueList[j].attrkey,
            attrValues: [commodityAttr[i].attrValueList[j].attrvalue]
          });
        }
      }
    }
    // console.log('result', attrValueList)  
    for (var i = 0; i < attrValueList.length; i++) {
      for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
        if (attrValueList[i].attrValueStatus) {
          attrValueList[i].attrValueStatus[j] = true;
        } else {
          attrValueList[i].attrValueStatus = [];
          attrValueList[i].attrValueStatus[j] = true;
        }
      }
    }
    this.setData({
      attrValueList: attrValueList
    });
  },
  getAttrIndex: function (attrName, attrValueList) {
    // 判断数组中的attrkey是否有该属性值  
    for (var i = 0; i < attrValueList.length; i++) {
      if (attrName == attrValueList[i].attrkey) {
        break;
      }
    }
    return i < attrValueList.length ? i : -1;
  },
  isValueExist: function (value, valueArr) {
    // 判断是否已有属性值  
    for (var i = 0; i < valueArr.length; i++) {
      if (valueArr[i] == value) {
        break;
      }
    }
    return i < valueArr.length;
  },
  /* 选择属性值事件 */
  selectAttrValue: function (e) {
    /* 
    点选属性值，联动判断其他属性值是否可选 
    { 
      attrkey:'型号', 
      attrValueList:['1','2','3'], 
      selectedValue:'1', 
      attrValueStatus:[true,true,true] 
    } 
    console.log(e.currentTarget.dataset); 
    */
    var attrValueList = this.data.attrValueList;
    var index = e.currentTarget.dataset.index;//属性索引  
    var key = e.currentTarget.dataset.key;
    var value = e.currentTarget.dataset.value;
    if (e.currentTarget.dataset.status || index == this.data.firstIndex) {
      if (e.currentTarget.dataset.selectedvalue == e.currentTarget.dataset.value) {
        // 取消选中  
        this.disSelectValue(attrValueList, index, key, value);
      } else {
        // 选中  
        this.selectValue(attrValueList, index, key, value);
      }
      var attrDesc = '已选择：';
      for (var i = 0; i < this.data.attrValueList.length; i++) {
        if (!this.data.attrValueList[i].selectedValue) {
          break;
        }
        attrDesc += this.data.attrValueList[i].attrkey + ':' + this.data.attrValueList[i].selectedValue + ' ';
        //value.push(this.data.attrValueList[i].selectedValue);
      }
      if (i >= this.data.attrValueList.length) {
        console.log(this.data.includeGroup);
        var seclectedArr = this.data.includeGroup[0];
        seclectedArr.goods_attr = attrDesc;
        if (!seclectedArr.goods_img) {
            seclectedArr.goods_img = this.data.goods.image[0];
        }
        this.setData({
          selectedInfo: seclectedArr
        });
      }
      console.log('11111111111', attrDesc);
    }
  },
  /* 选中 */
  selectValue: function (attrValueList, index, key, value, unselectStatus) {
    // console.log('firstIndex', this.data.firstIndex);  
    var includeGroup = [];
    if (index == this.data.firstIndex && !unselectStatus) { // 如果是第一个选中的属性值，则该属性所有值可选  
      var commodityAttr = this.data.commodityAttr;
      // 其他选中的属性值全都置空  
      // console.log('其他选中的属性值全都置空', index, this.data.firstIndex, !unselectStatus);  
      for (var i = 0; i < attrValueList.length; i++) {
        for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
          attrValueList[i].selectedValue = '';
        }
      }
    } else {
      var commodityAttr = this.data.includeGroup;
    }

    // console.log('选中', commodityAttr, index, key, value);  
    for (var i = 0; i < commodityAttr.length; i++) {
      for (var j = 0; j < commodityAttr[i].attrValueList.length; j++) {
        if (commodityAttr[i].attrValueList[j].attrkey == key && commodityAttr[i].attrValueList[j].attrvalue == value) {
          includeGroup.push(commodityAttr[i]);
        }
      }
    }
    attrValueList[index].selectedValue = value;

    // 判断属性是否可选  
    for (var i = 0; i < attrValueList.length; i++) {
      for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
        attrValueList[i].attrValueStatus[j] = false;
      }
    }
    for (var k = 0; k < attrValueList.length; k++) {
      for (var i = 0; i < includeGroup.length; i++) {
        for (var j = 0; j < includeGroup[i].attrValueList.length; j++) {
          if (attrValueList[k].attrkey == includeGroup[i].attrValueList[j].attrkey) {
            for (var m = 0; m < attrValueList[k].attrValues.length; m++) {
              if (attrValueList[k].attrValues[m] == includeGroup[i].attrValueList[j].attrvalue) {
                attrValueList[k].attrValueStatus[m] = true;
              }
            }
          }
        }
      }
    }
    // console.log('结果', attrValueList);  
    this.setData({
      attrValueList: attrValueList,
      includeGroup: includeGroup
    });

    var count = 0;
    for (var i = 0; i < attrValueList.length; i++) {
      for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
        if (attrValueList[i].selectedValue) {
          count++;
          break;
        }
      }
    }
    if (count < 2) {// 第一次选中，同属性的值都可选  
      this.setData({
        firstIndex: index
      });
    } else {
      this.setData({
        firstIndex: -1
      });
    }
  },
  /* 取消选中 */
  disSelectValue: function (attrValueList, index, key, value) {
    var commodityAttr = this.data.commodityAttr;
    attrValueList[index].selectedValue = '';

    // 判断属性是否可选  
    for (var i = 0; i < attrValueList.length; i++) {
      for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
        attrValueList[i].attrValueStatus[j] = true;
      }
    }
    this.setData({
      includeGroup: commodityAttr,
      attrValueList: attrValueList
    });

    for (var i = 0; i < attrValueList.length; i++) {
      if (attrValueList[i].selectedValue) {
        this.selectValue(attrValueList, i, attrValueList[i].attrkey, attrValueList[i].selectedValue, true);
      }
    }
  },
  /* 点击确定 */
  submit: function () {
    var that = this;
    var value = [];
    for (var i = 0; i < that.data.attrValueList.length; i++) {
        if (!that.data.attrValueList[i].selectedValue) {
        break;
      }
        value.push(that.data.attrValueList[i].selectedValue);
    }
    if (i < that.data.attrValueList.length) {
      wx.showToast({
        title: '请选择属性',
        icon: 'loading',
        duration: 1000
      })
    } else {
        var selectedAttr = that.data.includeGroup[0];
        var goods_sub_id = selectedAttr ? selectedAttr.goods_sub_id : 0;
        var params = [];
        params.user_key = app.globalData.user_key,
        params.supplier_key = app.globalData.supplier_key,
        params.goods_id = that.data.goods_id;
        params.goods_sub_id = goods_sub_id;
        params.goods_num = that.data.num;
        app.addCart(params, function(res){
            if (res.status == 0) {
                that.getCartCount();
                wx.showToast({
                    title: res.info,
                    icon: 'sucess',
                    duration: 1000,
                    success: function(){
                        that.setData({
                            is_hide: 'none'
                        });
                    }
                });
            } else {
                wx.showModal({
                    title: '',
                    content: res.info,
                    showCancel: false
                });
            }
        });
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
      return {
          title: this.data.goods.goods_name,
		  desc: this.data.goods.second_name,
          path: '/pages/Goods/Details?goods_id=' + this.data.goods_id
      }
  }
})