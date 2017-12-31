<template>
  <!--<div class="main">-->
  <!--<img class="logo" src="../../static/logo-b.png" alt="logo"/>-->
  <!--<h1>test</h1>-->
  <!--</div>-->
  <div>
    <div id="container">
      <div class="wrap">
        <div id="hd" class="ue-clear">
          <!--<div class="logo" target="_blank"></div>-->
          <a href="http://www.tsinghua.edu.cn" class="logoTHU" target="_blank"></a>
          <div class="inputArea">
            <input type="text" class="searchInput" :value="searchText"/>
            <input type="button" class="searchButton" value="搜索" />
          </div>
        </div>
      </div>


      <div id="bd" class="ue-clear">
        <div id="main">
          <div class="sideBar">
            <div class="subfield">搜索范围</div>
            <ul class="subfieldContext">
              <li>
                <span class="name" @click="switchToWeb">全网</span>
              </li>
              <li>
                <span class="name" @click="switchToNews">新闻</span>
              </li>
              <li>
                <span class="name" @click="switchToPdf">PDF</span>
              </li>
            </ul>
            <div class="subfield" v-if="type==='news'">全部时间</div>
            <ul class="subfieldContext" v-if="type==='news'">
              <li>
                <span class="name">一年内</span>
              </li>
              <li>
                <span class="name">五年内</span>
              </li>
            </ul>
            <div class="sideBarShowHide">
              <a href="javascript:;" class="icon"></a>
            </div>
          </div>
          <div v-if="searching">
            <span>搜索中</span>
          </div>
        <div class="resultArea" v-if="!searching">
          <p class="resultTotal">
            <span class="info-search">找到约 {{this.numResultsText}} 条结果 （用时 {{this.numQueryTimeText}} 秒）</span>
            <span class="orderOpt">
              <!--<a href="javascript:;" class="byTime">按时间排序</a>
              <a href="javascript:;" class="byDependence">按相关度排序</a>-->
            </span>
          </p>
          <div class="resultList">
            <div class="verticalSearch">
              <div class="verticalHead">
                <a href="www.baidu.com" class="title">{{this.showSearchText}}</a>
              </div>
              <div class="verticalBody" v-for="item in items">
                <div class="verticalBodyTitle">
                  <a :href="item._source.url" v-html="computeTitle(item)" target="_blank" class="title"></a>
                </div>
              </div>
            </div>
            <div class="resultItem" v-for="item in items">
              <div class="itemHead">
                <a :href="item._source.url" v-html="computeTitle(item)" target="_blank" class="title"></a>
              </div>
              <div class="itemBody">
                <p v-html="computeContent(item)" ></p>
              </div>
              <div class="itemFoot">
                  <span class="info-search">
                    <span class="value">{{truncateUrl(item._source.url)}}</span>
                  </span>
                <span class="info-search">
                  <span class="value" v-if="type==='news'">{{item._source.time && item._source.time.slice(0, 10)}}</span>
                </span>
              </div>
            </div>
          </div>
          <!-- 分页 -->
          <div class="pagination ue-clear"></div>

          <div class="pageBar" @submit="onSubmitSearchPrev">
            <!--<input type="button" class="prev" value="上一页" @click="onSubmitSearchPrev"/>-->
            <a class="prev" @click="onSubmitSearchPrev">上一页</a>
          </div>
          <div class="pageBar" @submit="onSubmitSearchNext">
            <!--input type="button" class="next" value="下一页" @click="onSubmitSearchNext"/>-->
            <a class="prev" @click="onSubmitSearchPrev">下一页</a>
          </div>
          <div class="pageNowInfo">
            <span class="pageInfo">
              目前是第 <em>{{this.pageNow + 1}}</em> 页
            </span>
          </div>
          <form class="bottomInputArea" @submit="onSubmitSearch">
            <input type="text" class="searchInput" v-model="searchText"/>
            <input type="button" class="searchButton" value="搜索" @click="onSubmitSearch"/>
          </form>
          </div>
        </div><!-- End of main -->
      </div><!--End of bd-->
    </div>
    <div id="foot"></div>
  </div>
</template>

<script>
  import ElasticSearch from 'elasticsearch'
  import {genWebQuery, genNewsQuery, genPdfQuery} from '../util/ElasticHelper'
  import {trimString} from '../util/StringHelper'
  export default {
    name: 'results',
    data () {
      return {
        searchText: '',
        searching: false,
        numResults: 0,
        numQueryTime: 20,
        items: [],
        type: 'web',
        pageNow: 0
      }
    },
    computed: {
      showSearchText: function () {
        return this.searchText === undefined ? "" : this.searchText + "的最新消息"
      },
      numResultsText: function () {
        return this.numResults === undefined ? 0 : this.numResults
      },
      numQueryTimeText: function () {
        return this.numQueryTime === undefined ? 0 : this.numQueryTime / 1000
      }
    },
    methods: {
      onSubmitSearch: function () {
        if (this.searchText.length === 0) {
          return
        }
        this.$router.replace({path: '/results', query: {searchText: this.searchText}})
        this.searching = true
        let bodyFunc = genWebQuery
        let index
        let docType
        switch (this.type) {
          case 'web':
            bodyFunc = genWebQuery
            index = 'thuweb'
            docType = 'webpage'
            break
          case 'news':
            bodyFunc = genNewsQuery
            index = 'thunews'
            docType = 'news'
            break
          case 'pdf':
            bodyFunc = genPdfQuery
            index = 'thupdf'
            docType = 'pdf'
            break
          default:
            bodyFunc = genWebQuery
            break
        }
        var es = ElasticSearch.Client({
          host: 'http://localhost:9200'
        })
        es.search({
          index,
          type: docType,
          body: bodyFunc(this.searchText, 10 * this.pageNow)
        }).then(response => {
          this.numQueryTime = response.took
          var hits = response.hits
          this.numResults = hits.total
          this.items = hits.hits
          this.searching = false
        }).catch(error => {
          this.searching = false
          console.log(error)
        })
      },
      switchToWeb: function () {
        this.type = 'web'
        this.onSubmitSearch()
      },
      switchToNews: function () {
        this.type = 'news'
        this.onSubmitSearch()
      },
      switchToPdf: function () {
        this.type = 'pdf'
        this.onSubmitSearch()
      },
      onSubmitSearchPrev: function () {
        if (this.pageNow === 0) {
          this.onSubmitSearch()
        } else {
          this.pageNow = this.pageNow - 1
          this.onSubmitSearch()
        }
      },
      onSubmitSearchNext: function () {
        var totalPages
        totalPages = this.numResults / 10
        if (totalPages % 10 !== 0) {
          totalPages = totalPages + 1
        }
        if (this.pageNow === totalPages) {
          this.onSubmitSearch()
        } else {
          this.pageNow = this.pageNow + 1
          this.onSubmitSearch()
        }
      },
      computeContent: function (item) {
        // TODO
        if (!item.highlight || !item.highlight.content) {
          if (!item._source.content) {
            return '请点击网页查看内容'
          }
          return trimString(item._source.content).slice(0, 200)
        }
        if (item.highlight.content.length === 1) {
          return trimString(item.highlight.content[0])
        } else {
          return trimString(item.highlight.content[0] + '...')
        }
      },
      computeTitle: function (item) {
        // TODO
        console.log(item)
        if (!item.highlight || !item.highlight.title) {
          if (!item._source.title) {
            return '请点击查看结果'
          }
          return trimString(item._source.title)
        }
        return trimString(item.highlight.title[0])
      },
      truncateUrl (url) {
        if (url === undefined) {
          return
        }
        var tidyUrl = url.replace('http://', '')
        tidyUrl = tidyUrl.replace('https://', '')
        var urlReg = /[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?/
        var showUrl = urlReg.exec(url)
        if (tidyUrl.length === showUrl[0].length) {
          showUrl[0] = showUrl[0] + '/'
        } else {
          showUrl[0] = showUrl[0] + '/...'
        }
        return showUrl[0]
      },
      showTime (time) {
        if (time === undefined) {
          return
        }
      }
    },
    mounted: function () {
      var es = ElasticSearch.Client({
        host: 'http://localhost:9200'
      })
      this.searchText = this.$route.query.searchText
      this.searching = true
      es.search({
        index: 'thuweb',
        type: 'webpage',
        body: genWebQuery(this.$route.query.searchText, 0)
      }).then(response => {
        this.numQueryTime = response.took
        var hits = response.hits
        this.numResults = hits.total
        this.items = hits.hits
        this.searching = false
      }).catch(error => {
        this.searching = false
        console.log(error)
      })
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  html{*overflow:auto;}
  #hd{padding:20px 10px;}
  #bd{margin-bottom:40px;}
  .logo{float:left;margin-right:30px; height:33px;}
  .logoTHU{float:left;margin-right:30px;height:33px;}
  /*input搜索区域*/
  .inputArea{float:left;position:relative;}
  .inputArea .searchInput{border:1px solid #bfbfbf;padding:0 15px;outline:none;height:35px;*line-height:35px;width:450px; background:url(../img/inputbg.png);font-size:14px;}
  .inputArea .searchButton{position:absolute;left:500px;top:0;*top:1px;*left:500px;width:106px;height:36px;background:#87699e no-repeat;border:none;cursor:pointer;
    color: #fff;}

  /*返回高级搜索*/
  .inputArea .advanced{position:absolute;font-size:14px;left:500px;top:12px;width:60px;text-decoration:underline;}

  /*底部搜索栏*/
  .bottomInputArea {clear: both; position:relative; top:20px;}
  .bottomInputArea .searchInput{border:1px solid #bfbfbf;padding:0 15px;outline:none;height:35px;*line-height:35px;width:450px; background:url(../img/inputbg.png);font-size:14px;
    bottom: 10px;}
  .bottomInputArea .searchButton{position:absolute;left:500px;top:0;*top:1px;*left:500px;width:106px;height:36px;background:#87699e no-repeat;border:none;cursor:pointer;
    color: #fff;
    bottom: 10px;}

  /*分界区域，导航*/
  .nav{margin-bottom:24px;height:31px;background:#f9f9f9;border-bottom:1px solid #e0e0e0;padding:5px 0 0 210px;}
  .searchList{float:left;padding-left:5px;}
  .searchList .searchItem{float:left;margin-right:15px;font-size:14px;padding:0 3px 2px 3px;cursor:pointer;height:26px; line-height:26px;}
  .searchList .searchItem.current{color:#87699e;border-bottom:3px solid #9cc813;font-weight:bold;}
  .nav .tips{color:#969696;font-size:12px;line-height:24px;*line-height:26px;}
  #container.sideBarHide .nav{padding-left:35px;}

  /*#main区域样式*/
  #main{padding:0 215px 0 182px;}
  #main.sideBarHide{padding-left:10px;}
  /*侧边栏搜索条件*/
  .sideBar{position:relative;float:left;margin-left:-182px;width:182px;}
  .sideBar .subfieldContext{margin-bottom:20px;padding-left:25px;}
  .sideBar .subfieldContext li{margin-bottom:5px;cursor:pointer;}
  .sideBar .subfieldContext input[type=text]{width:75px;}
  .sideBar .unit{color:#787878;}

  /*更多按钮*/
  .sideBar .more a:hover{text-decoration:none;}
  .sideBar .more .moreIcon{display:inline-block;position:relative;top:-1px;*top:-3px;left:2px;*left:-1px;width:9px;height:5px;background:url(../img/more.png);}
  .sideBar .more.show .moreIcon{background:url(../img/down.png);top:-2px;}

  .sideBar .reset{padding-left:25px;}
  /*siderBar区域显隐控制*/
  .sideBar .sideBarShowHide{position:absolute;right:0px;top:20px;height:177px;width:1px; background:url(../img/line.png) right;}
  .sideBar .sideBarShowHide a{position:absolute;top:70px;left:-11px;display:inline-block;width:12px;height:31px;background:url(../img/lr.png);}

  .sideBar .sideBarShowHide a:hover{background-position:0 -31px;}

  /*左侧收起样式*/
  #main.sideBarHide .sideBar{margin-left:-191px;*margin-left:-182px;}
  #main.sideBarHide .sideBar .sideBarShowHide{-moz-transform:rotate(180deg); -o-transform:rotate(180deg); -webkit-transform:rotate(180deg); transform:rotate(180deg);}
  #main.sideBarHide .sideBar .sideBarShowHide a{*background:url(../img/ll.png);}
  #main.sideBarHide .sideBar .sideBarShowHide a:hover{*background-position:0 -31px;}
  #main.sideBarHide .sideBar .sideBarShowHide{background:none;}

  .resultArea{float:left;width:70%;}
  .resultArea .resultTotal{position:relative;padding-left:30px;margin-bottom:20px;}
  .resultArea .resultTotal .info-search{color:#9a9a9a;}
  .resultArea .resultTotal .orderOpt{position:absolute;right:10px;}
  .resultArea .resultTotal .orderOpt a{margin-right:10px;color:#0080cc;}

  /*搜索结果列表区域*/
  .resultArea .resultList{padding-left:30px;}
  .resultArea .resultList .resultItem{margin-bottom:20px;}
  .resultArea .resultList .resultItem{margin-bottom:30px;}
  .resultArea .resultList .itemHead{margin-bottom:5px;color:#767676;}
  .resultArea .resultList .itemHead .keyWord{color:#d90909;}
  .resultArea .resultList .itemBody .keyWord{color:#d90909;}
  .resultArea .resultList .itemHead a.title{font-size:16px;color:#0080cc;text-decoration:underline;}
  .resultArea .resultList .itemHead .value{color:#008000;}
  .resultArea .resultList .itemHead .divsion{margin:0 5px;}
  .resultArea .resultList .itemHead .fileType{margin-right:10px;}

  /*搜索内容主体*/
  .resultArea .resultList .itemBody{margin-bottom:5px;line-height:18px;width:100%;}
  .resultArea .resultList .itemFoot{color:#008000;}
  .resultArea .resultList .itemFoot .info-search{margin-right:10px;}

  .resultArea .pagination{margin-bottom:25px;padding-left:32px;}
  /*相关搜索*/
  .resultArea .dependSearch{margin-bottom:30px;padding-left:32px;font-size:14px;}
  .resultArea .dependSearch h6{float:left;margin-right:15px;font-weight:bold;}
  .resultArea .dependSearch p{margin-bottom:5px;}
  .resultArea .dependSearch a{display:inline-block;margin-right:15px;text-decoration:underline;width:90px; white-space:nowrap; overflow:hidden;text-overflow:ellipsis;}
  .resultArea .searchInResult{padding-left:35px;}
  .resultArea .searchInResult .inResult{position:absolute;right:-190px;top:8px;font-size:14px;text-decoration:underline;}
  .resultArea .searchInResult .searchButton{left:417px;}
  /*历史搜索区域*/
  .historyArea{float:right;margin-right:-212px;width:212px;}
  .historyArea h6{margin-bottom:10px;font-weight:bold;}
  .historyArea .historyList{margin-bottom:20px;}
  .historyArea .historyList li{margin-bottom:5px;}



  /*左侧分栏区域*/
  .subfield{margin-bottom:5px;font-size:14px;font-weight:bold;padding:2px 0 2px 24px;}
  .subfield:first-child{border-left:4px solid #87699e;padding-left:20px;}



  /*立即搜索样式*/
  .subfieldContent .search{margin:45px 0 0 135px;width:130px;height:36px;background:url(../img/btnbg.png); font-weight:bold;border:none;border:1px solid #bfbfbf;line-height:36px;}
  /*联想下拉区域*/
  .inputArea .dataList{display:none;position:absolute;left:0;top:42px;*top:43px;width:550px;padding:5px 0;background:#fff;border:1px solid #bfbfbf;border-top:none;}
  .inputArea .dataList li{padding:2px 15px;font-size:14px;}
  .inputArea .dataList li:hover{background:#f0f0f0;color:#0080cc;font-weight:bold;}


  /*css reset*/
  html, body, div, span, object, iframe, h1, h2, h3, h4, h5, h6, p, blockquote, pre, a, abbr, acronym, address, code, del, dfn, em, img, q, dl, dt, dd, ol, ul, li, fieldset, form, label, legend, table, caption, tbody, tfoot, thead, tr, th, td , i{
    margin:0;
    padding:0;
    border:0;
    font-weight:inherit;
    font-style:inherit;
    font-size:100%;
    font-family:inherit;
    vertical-align:baseline;
  }
  body {line-height:1.5;}
  table {border-collapse: collapse;border-spacing:0;}
  caption, th, td ,b,strong{text-align:left;font-weight:normal;}
  table, td, th {vertical-align:middle;}
  blockquote:before, blockquote:after, q:before, q:after {content:"";}
  blockquote, q {quotes:"" "";}
  a img {border:none;}
  em,cite{font-style:normal;}


  body { background:#fff; font: 12px/1.5 Tahoma,'宋体';color:#000;}
  h1, h2, h3, h4, h5, h6 {font-weight:normal;color:#111;}
  a {text-decoration:none;cursor:pointer;}
  dl, dt, dd, ol, ul, li{ list-style:none;}

  /*some common class*/
  .left{float:left;}
  .right{float:right;}

  /*clear*/
  .ue-clear:after{content: ".";display:block;height:0;clear:both;visibility:hidden;}
  .ue-clear{display:inline-block;}
  *html .ue-clear{height:1%;}
  .ue-clear{display:block;}

  a{color:#0080cc;}
  a:hover{color:#87699e;text-decoration:underline;}
  /*logo样式*/
  .logo{width:165px;height:55px; background: url(../img/logoTsinghua.png) no-repeat center center;}
  .logoTHU{width:165px;height:55px; background: url(../img/logoTsinghua.png) no-repeat center center;}

  /*choose样式*/
  .choose{float:left;margin-right:15px;white-space:nowrap;}
  .choose .text{float:left;padding-left:20px;*padding-left:16px;white-space:nowrap; vertical-align:text-bottom;}
  .choose input[type=radio],.choose input[type=checkbox]{position:relative;*top:-3px;float:left;margin-right:-16px;}

  /*====================================
    分页信息（表格依赖样式）
    ===================================*/
  .pageBar{font-size:14px;}
  .pageBar a {
    color:#032F54;
    border-color:#8EB2D2;
    text-decoration: none;
    border: solid 1px;
  }
  .pagination .pxofy{float:left;margin-left: 5px;height:25px;*padding-top:1px;}
  .pageBar a, .pageBar span {display: block;float: left;height:18px;line-height:18px;padding:0 6px;margin-right: 5px;font-family:Arial, Helvetica, sans-serif !important;}
  .pageBar .current {cursor:default;border: solid 1px ;}
  .pageBar.prev, .pageBar.next{*line-height:22px;}

  /*分页样式*/
  .pagination a{color: #032F54;border-color:#8EB2D2;}
  .pagination a:hover{color:#023054;border-color:#8EB2D2;background:#B8DFFB;}
  .pagination .current{color:#fff;border-color:#5c9bc4;background:#89B8D8;}
  .pagination .current.prev, .pagination .current.next{color:#B9B9B9;border-color:#D3D3D3;background:#fff;}
  .pagination .pxofy{color: #023054;}

  #foot{height:1px;line-height:32px; text-align:center;background:#f9f9f9;top: 1px;}
  /*
  .pageBar .unselected {
    border: 1px solid;
    border-color: #d5d5d5;
    border-radius: 2px;
  }*/

  .pageBar .selected {
    border: 1px solid;
    border-color: #d5d5d5;
    background-color: #efefef;
    font-weight: bold;
  }
  .pageBar a, .pageBar .selected {
    min-width: 34px;
    _width: 34px;
    height: 34px;
    display: block;
    line-height: 34px;
    text-align: center;
    border-radius: 2px;
    margin-right: 10px;
    vertical-align: middle;
    float: left;
    font-size: 14px;
  }
  .pageNowInfo span {
    min-width: 34px;
    _width: 34px;
    height: 34px;
    display: block;
    line-height: 34px;
    text-align: center;
    border-radius: 2px;
    margin-right: 10px;
    vertical-align: middle;
    float: left;
    font-size: 14px;
  }


  .wrap {
    position: relative;
    height: 90px;
    z-index: auto;
    min-width: 1001px;
    _width: auto;
    zoom: 1;
    background: url(../img/topbg.jpg)repeat-x;
  }


</style>

<style>
  .itemHead em {
    color: red;
    font-style: normal;
  }
  .itemBody em {
    color: red;
    font-style: normal;
  }
  .pageNowInfo em {
    color: #87699e;
    font-style: normal;
  }
</style>
