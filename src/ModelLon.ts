
export interface SProperty {
  /**Database colname */
  colName?: string;
  /**Database coltype */
  colType?: string;
  /**Default value */
  defaultVal?: string | number | boolean;
  initJsVal?: string | number | boolean;
  cssClass?:string,
  /**Defined set of values for property */
  inList?: Array<string | number>;
  /**Define if the property must be exclude from select and encoded before insert/update*/
  isPassword?: boolean;
  /**Label */
  l?: string;
  /**The max value */
  max?: number;
  min?: number;
  n: string;
  nUp?: string;
  nullable?: boolean;
  onForm?: string | undefined;

  

  /**Required */
  rq?: boolean | undefined;
  /**Automatic set by the server side */
  setBySys?: string | undefined;

  size?: number;
  /**Type data */
  t: string;//type: //references 
  template?: string;
  /**Unique */
  unique?: true;
  withIndex?: true;
  inZtat?:string | undefined  ,
  jsFmt?:JsFMt|undefined

}

type JsFMt = "formatPrice"
export interface SFormula{
    n: string;
    t: string;
    fn: string, 
    fn0:Array<any>,
    jsFmt?:JsFMt|undefined,
    ignoreInSum:boolean|undefined
}

export type DCJsModelKey = string




export interface SMTO {
    nullable?: boolean
    tDw?: string;
    dcTable?: string | undefined;
    colType?: string;
    dcSqlAlias?: string,
    colName?: string
    n: string,
    t: DCJsModelKey,
    pc?: number,
   /* from?: string,*/
    setBySys?: string | undefined,
    rq?: boolean | undefined,
    onForm?: string | undefined,
    nUp?: string,
    fromSMTO?:any,
    fromSMTO2?:any,
    l?:string|undefined,
    inChildFormAsList?:boolean| undefined,
    tmplOnAcParent?:Array<string>| undefined,
    dependsOn?:Array<string> | undefined

}

export interface SOTM {
    onRelationSql?: string;
    tDw?: string;
    dcTable?: string | undefined;
    t: DCJsModelKey,
    n: string,
    onRelation?: string,
    nUp?: string,
    l?:string
}


export interface autoPkeyI{
    formula:Array<string>
}

export interface DCJsModel {
    pcn?: string;
    pDw?: string;
    dcname?: string;
    tableName?: string,
    dc?: string,
    pc?: number,
    ps?: Array<SProperty>,
    parents?: Array<SMTO>,
    childs?: Array<SOTM>,
    withDate?: boolean,
    withDateTime?: boolean,
    withBigDecimal?: boolean,
    parentsRestrict?: Array<string>,
    dcMsg?:string,
    lDcMsg?:string,
    autoPkey?:autoPkeyI,
    inMemory?:boolean,
    psFormula?:Array<SFormula> | undefined,
    tableCols?:Array<SProperty | SFormula> | undefined
    
    //ztats?: Array<string>
}


export interface ModelILon {
    [key: DCJsModelKey]: DCJsModel
}




