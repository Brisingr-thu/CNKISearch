<template>
    <div class="main">
      <progressive-background class="background" src="../../static/bk.jpg"></progressive-background>

      <div class="content">
        <h1>Explore Tsinghua Now</h1>
        <form class="search-form"  @submit="onSubmitSearch">
            <v-text-field
                    name="search-input"
                    label="Search Here"
                    prepend-icon="search"
                    v-model="searchText"
                    light
            ></v-text-field>

        </form>
      </div>
    </div>
</template>

<script>
  export default {
    name: 'search',
    data () {
      return {
        searchText: ''
      }
    },
    methods: {
      onSubmitSearch () {
        console.log(this.searchText)
        if (this.searchText.length === 0) {
          return
        }
        this.$router.push({path: '/results', query: {searchText: this.searchText}})
        return
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .main {
    width: 40%;
    margin: 0 auto;
    padding-top: 15%;
  }
  h1 {
    text-align: center;
    font-weight: normal;
    font-size: 56px;
    color: lightgrey;
    margin-top: 0px;
  }
  .background{
    position: absolute;
    opacity: 1;
    top: 0;
    left: 0;
    z-index: -100;
  }
  .search-form{
      margin-top: 5%
  }
  .content{
    position: relative;
    z-index: 100;
  }
</style>
