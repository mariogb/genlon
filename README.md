# Instructions
1. Install node    
2. Download Vx4Vu3
3. Config in domainDefinitions.js the next values

```javascript
prjRoot = "PathToDirWhereIsLocated/Vx4Vu3"  

//Java project dir expected
const srcJavaOut = `${prjRoot}/src/main/java`

///POJO
const foutDcClzz = `${srcJavaOut}/org/lonpe/model`;


//Pojos definitions, transformations
const foutDcServiceClzz = `${srcJavaOut}/org/lonpe/services`; 


const foutDcMapStoreClzz = `${srcJavaOut}/org/lonpe/mapstore`;//PojoMap Store
const foutDCMapService = `${srcJavaOut}/org/lonpe/services`; 
```

4. Adjust Model in model.js

5. Generate Code

In bash execute
```bash

pathToNode/node domainDefinitions.js
```

** Definitions

This is a TypeScript code that defines several interfaces and types used for defining data models in JavaScript applications. 

The `SProperty` interface defines properties of a data model, such as column names, types, default values, etc. It also includes some optional properties like `cssClass`, `inList`, and `isPassword`. 

The `SFormula` interface defines a formula for the data model. It includes a name, a type, a function, and an optional `jsFmt` property that specifies a JavaScript format for the formula. 

The `DCJsModelKey` type is simply a string type alias used for defining keys of an object. 

The `SMTO` interface defines a "single many-to-one" relationship between two data models. It includes properties such as the target data model's name, its column name, and its type. 

The `SOTM` interface defines a "single one-to-many" relationship between two data models. It includes properties such as the target data model's name, its column name, and its type. 

The `autoPkeyI` interface defines an automatic primary key for a data model. It includes a formula property, which is an array of strings. 

The `DCJsModel` interface defines a data model, including its properties, parents, and child models. It also includes several optional properties such as `withDate`, `withDateTime`, and `withBigDecimal`. 

The `ModelILon` interface defines an object that maps data model keys to data model objects.



