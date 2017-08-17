const Configstore = require('configstore');
const pkg = require('./package.json');
 
// create a Configstore instance with an unique ID e.g. 
// // Package name and optionally some default values 
 const conf = new Configstore(pkg.name, {foo: 'bar'}, {globalConfigPath: true});
//  
  console.log(conf.get('foo'));
//  //=> 'bar' 
//   
   conf.set('awesome', true);
   console.log(conf.get('awesome'));
//   //=> true 
//    
//    // Use dot-notation to access nested properties 
    conf.set('bar.baz', true);
    console.log(conf.get('bar'));
//    //=> {baz: true} 
