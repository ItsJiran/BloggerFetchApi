class BlogSearch{
  constructor(){
    this.BlogSearchInfo = new BlogSearchInfo();
    this.ApiBuilder     = new BlogSearchApiBuilder();
  }
  buildApiUrl(){
    return this.ApiBuilder.build( this.BlogSearchInfo );
  }
}
class BlogSearchInfo{
  // This class is entity to the information that the
  // blogger has, like query and etc
  constructor(location = window.location){
      this.host     = location.host;
      this.hostname = location.hostname;
      this.origin   = location.origin;
      this.pathname = location.pathname;
      this.label    = undefined;
      this.queries = {
        'current-page' : 1,      
      }; 
      this.reset();
      this.build();
  }  

  // build queries
  validator( key,value ) {
    if(key == 'current-page' && value <= 0) return false;  
    return true;
  }
  build(){
    this.buildQueries();
    this.buildLabel();
  }
  buildQueries(path = window.location.search){
    const params = new URLSearchParams(window.location.search)
    for( let key in Object.fromEntries(params.entries()) ){
      if ( !this.validator(key,this.queries[key]) ) continue;
      if ( params.getAll(key).length > 1 ) this.queries[key] = params.getAll(key);          
      else                                 this.queries[key] = params.get(key);                
    }
  }
  buildLabel(path = window.location.pathname){
    let paths = path.split('/');
    // url / "/search/label/[label-name]"
    if(paths[1] == 'search' && paths[2] == 'label')
      this.label = paths[3];
  }

  // getter setter
  get(key){
    return this[key];
  }
  set(key,value){
    this[key] = value;    
  }  
  reset(){
    this.queries = {
      'current-page' : 1,      
    }; 
  }
}
class BlogSearchApiBuilder{
  constructor(){
    this.api_path = '/feeds/posts/default';
    this.property = {      
      'start-index' : 1,
      'max-result' : 6,
      'alt' : 'json',
    }
  } 
  build( blog_info ) {
    // /1|l0v3|u|354\ 
    if(blog_info instanceof BlogSearchInfo == false) 
      throw Error('Blog info should be instance of BlogSearchInfo');

    // setup pagination propety
    let queries = this.property;
    queries['start-index'] += ( this.property["max-result"] * ( blog_info.queries['current-page'] - 1 ) );

    // api queries
    let api_url = this.buildQueries(queries);
        
    // determine if there's a label search or not
    if(blog_info.label != undefined) api_url = '/-/' + blog_info.label + api_url;
    
    // return combine with the api_path
    return blog_info.host + this.api_path + api_url;
  }
  buildQueries( queries = {}, path = '?' ){    
    for( let key in queries ){
      if( path.length != 1 ) path += '&';
      if( Array.isArray(queries[key]) ) {
        for( let value of queries[key] ) {
          if( path.length != 1 ) path += '&';
          path += key + '=' + value;          
        }
      } else {
          path += key + '=' + queries[key];          
      }
    }
    return path;
  }
}

