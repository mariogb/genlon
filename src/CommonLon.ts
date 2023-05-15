import * as fs from "fs";

import { DCJsModel, DCJsModelKey, ModelILon, SMTO, SOTM, SProperty } from "./ModelLon"

const model: ModelILon = require('./modelo.js').model
const toUp = (s: string) => {
    return s.substring(0, 1).toUpperCase() + s.substring(1)
}
const toDown = (s: string) => {
    return s.substring(0, 1).toLowerCase() + s.substring(1)
}

function camelize(str: string) {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
}

function camelToUnderscore(s: string) {
    var result = s.replace(/([A-Z])/g, " $1");
    return result.split(' ').join('_').toLowerCase();
}

function doDcName(dck: DCJsModelKey) {
    return dck.substring(0, 1).toLowerCase() + dck.substring(1)
}

function doDcTableName(dck: DCJsModelKey) {
    return camelToUnderscore(doDcName(dck))
}


function doDcColName(pn: string) {
    return camelToUnderscore(doDcName(pn))
}

function doDcColNameParent(p: SMTO) {
    return doDcColNameAsSql(p) + "_id" // camelToUnderscore(pn) + "_id"
}

function doDcColNameAsSql(p: SMTO) {

    return doDcTableName(p.n)
}

function doDcNameParentSql(pn: string) {
    return camelToUnderscore(pn)
}

const doColType = (p: SProperty) => {

    if (p.t === "LocalDate") {
        return 'Date';
    }
    if (p.t === "LocalDateTime") {
        return 'timestamp';

    }
    if (p.t === "BigDecimal") {
        return 'numeric(16,6)';
    }
    if (p.t === 'String') {
        let s = p.size !== undefined ? p.size : 256
        return "VARCHAR(" + s + ")"
    }
    if (p.t === 'Long') {
        return "bigint"
    }
    return p.t
}

export function toFile(f: string, data: string) {
    fs.writeFile(f, data, (err) => {
        if (err) {
            console.log(err)
            throw err
        }
    })
}

export function doExtendModel(model0: ModelILon) {
    //extend model
    for (const dck in model0) {
        let dcv: DCJsModel = model0[dck]
        dcv.dcname = doDcName(dck)

        if (dcv.tableName === undefined) {
            dcv.tableName = doDcTableName(dck)
        }

        dcv.pDw = toDown(dck)
        let ps: Array<SProperty> | undefined = dcv.ps

        if (ps === undefined) {
            ps = []
        }
        if (ps.findIndex((p: SProperty) => { return p.n === 'pkey' }) < 0) {
            ps.push({
                n: 'pkey',
                t: 'String',
                size: 32,
                unique: true
            })
        }


        ps = ps.sort((a: SProperty, b: SProperty) => {
            if (a.n === "pkey") {
                return -1;
            }
            if (b.n === "pkey") {
                return 1;
            }

            return a.n > b.n ? 1 : -1

        })


        let pcIdx: number = ps.findIndex(p => {
            return p.n === "pname" || p.n === "title" || p.n === "label"
        })

        if (pcIdx > -1) {
            dcv.pc = pcIdx
            dcv.pcn = ps[pcIdx].n
        }

        ps.forEach((p: SProperty) => {
            p.colName = doDcColName(p.n)
            p.colType = doColType(p)
            p.nUp = toUp(p.n)
            if (p.t === 'LocalDate') {
                dcv.withDate = true
            }
            if (p.t === 'LocalDateTime') {
                dcv.withDateTime = true
            }
            if (p.t === 'BigDecimal') {
                dcv.withBigDecimal = true
            }

        })

        dcv.ps = ps

    }

    //second extend
    for (const dck in model0) {
        let dcv: DCJsModel = model0[dck]
        const parents: Array<SMTO> | undefined = dcv.parents
        if (parents !== undefined) {
            parents.forEach((p: SMTO) => {
                p.colName = doDcColNameParent(p)
                p.dcSqlAlias = doDcColNameAsSql(p)
                p.colType = 'bigint'
                p.nUp = toUp(p.n)
                p.dcTable = model0[p.t].tableName //    doDcTableName(p.t)//doDcNameParentSql(p.n)
                p.tDw = toDown(p.t)
            })
        }
        const childs: Array<SOTM> | undefined = dcv.childs
        if (childs !== undefined) {
            childs.forEach((p: SOTM) => {
                p.nUp = toUp(p.n)
                p.dcTable = model0[p.t].tableName //    doDcTableName(p.t)//doDcNameParentSql(p.n)
                p.tDw = toDown(p.t)
                if (!p.onRelation) {
                    p.onRelation = dcv.dcname
                }
                if (p.onRelation) {
                    p.onRelationSql = camelToUnderscore(p.onRelation)
                }
            })
        }
    }
}


export function doSqlList00(dck: DCJsModelKey, dcv: DCJsModel):string {
    return doSqlList00_pre(dck,dcv,false)
}

export function doSqlCount00(dck: DCJsModelKey, dcv: DCJsModel):string {
    return doSqlList00_pre(dck,dcv,true)
}

function doSqlList00_pre(dck: DCJsModelKey, dcv: DCJsModel, isCount:boolean):string {

    function enDC1(p: SMTO) {
        const dcv1 = model[p.t]
        let s = `${p.dcSqlAlias}.id as ${p.colName},${p.dcSqlAlias}.pkey as ${p.dcSqlAlias}_pkey`;
        const pc = dcv1.pc;
        if (dcv1.ps && pc && pc > -1) {
            const pc1 = dcv1.ps[pc]
            s += `,${p.dcSqlAlias}.${pc1.colName} as ${p.dcSqlAlias}_${pc1.colName}`;
        }
        return s
    }


    function enDC2(p2: SMTO, p2SqlName: string) {
        const dcv2 = model[p2.t]

        let s = `${p2.dcSqlAlias}.id as ${p2.dcSqlAlias}_id, ${p2.dcSqlAlias}.pkey as ${p2.dcSqlAlias}_pkey`
        const pc = dcv2.pc;
        if (pc && dcv2.ps && pc > -1) {
            const pc2 = dcv2.ps[pc]
            s += `,${p2.dcSqlAlias}.${pc2.colName} as ${p2.dcSqlAlias}_${pc2.colName}`
        }
        return s
    }

    function applyenDC2(l_: Array<any>, p2: SMTO, p: SMTO) {
        const dcv2: DCJsModel = model[p2.t]
        const tb2: string | undefined = dcv2.tableName

        let p2SqlName: string | undefined = p2.dcSqlAlias

        let tblAlias2 = ` ${tb2} as ${p2SqlName}`
        tables.push(tblAlias2)
        relations.push(`${p.dcSqlAlias}.${p2.dcSqlAlias}_id = ${p2SqlName}.id`)
        l_.push(enDC2(p2, `${p2SqlName}`))

        return p2SqlName
    }

    const tb0 = dcv.tableName
    const used: any = {}
    const ps = dcv.ps
    const l0 = [`${tb0}.id as ${tb0}_id`]
    const relations: any[] = []

    const tables = [tb0]
    if (ps !== undefined) {
        ps.filter(p => { return p.isPassword !== true }).forEach((p) => {
            l0.push(`${tb0}.${p.colName} as ${tb0}_${p.colName}`)
        })
    }

    const parents = dcv.parents
    if (parents !== undefined) {
        parents.forEach(p => {

            const dcv1 = model[p.t]
            const tb1 = dcv1.tableName

            if (used[p.n] === undefined) {
                used[p.n] = 1
            }

            let tblAlias = ` ${tb1} as ${p.dcSqlAlias}`

            tables.push(tblAlias)
            l0.push(enDC1(p))
            relations.push(`${tb0}.${p.dcSqlAlias}_id = ${p.dcSqlAlias}.id`)

            const parents2 = dcv1.parents
            if (parents2 !== undefined) {
                parents2.forEach(p2 => {
                    if (used[p2.n] === undefined) {
                        const dcv2 = model[p2.t]
                        used[p2.n] = 1


                        const p2SqlName = applyenDC2(l0, p2, p)

                        const parents3 = dcv2.parents
                        if (parents3 !== undefined) {

                            parents3.forEach(p3 => {

                                if (used[p3.n] === undefined) {
                                    const dcv3 = model[p3.t]
                                    const tb3 = dcv3.tableName
                                    const p3SqlName = applyenDC2(l0, p3, p2)
                                    used[p3.n] = 1
                                }

                            })
                        }
                    }


                })

            }

        })
    }

    let relationString = ""
    if (relations.length > 0) {
        relationString = ` \n WHERE \n ${relations.join("\n AND ")}`
    }

    let sr = `SELECT ` 
    sr+= isCount ? ` count(${tb0}.id) `: ` ${l0.join(",\n")} `
    sr+= `
  FROM 
  ${tables.join(",\n ")} ${relationString}`
  return sr;



}

const doPs0 = (dck:DCJsModelKey, dcv:DCJsModel) =>{
    const ps = dcv.ps
    if (ps === undefined) {
        return ""
    }
    const l = ps.filter(p => {
        return p.n !== 'pkey'
    }).map(p => {
        return `
    private ${p.t} ${p.n};

    /**
     *
     * @return ${p.n}
     */    
    public ${p.t} get${p.nUp}(){
        return this.${p.n};
    }

    /**
     *
     * @param ${p.n}
     */    
    public void set${p.nUp}(${p.t} ${p.n}){
        this.${p.n} = ${p.n};
    }           `
    })

    return l.join("\n")

}

const doParents0 = (dck:DCJsModelKey, dcv:DCJsModel) =>{
    const parents = dcv.parents
    if (parents === undefined) {
        return ""
    }
    const s = parents.map(p => {
        return `
    private ${p.t} ${p.n};

    /**
     *
     * @return ${p.n}
     */  
    public ${p.t} get${p.nUp}(){
        return this.${p.n};
    }

    /**
     *
     * @param ${p.n}
     */       
    public void set${p.nUp}(${p.t} ${p.n}){
        this.${p.n} = ${p.n};
    }`
    }).join("\n");
    return s
}

const doChilds0 = (dck:DCJsModelKey, dcv:DCJsModel) => {
    const childs = dcv.childs
    if (childs === undefined) {
        return ""
    }

    const s = childs.map(p => {
        return `
    private Set<${p.t}> ${p.n};

    /**
     *
     * @return ${p.n}
     */     
    public Set<${p.t}> get${p.nUp}(){
        return this.${p.n};
    }
    
    /**
     *
     * @param ${p.n}
     */       
    public void set${p.nUp}(Set<${p.t}> ${p.n}){
        this.${p.n} = ${p.n};
    }
 `
    }).join("\n");

    return s

}

const addImports = (dcv:DCJsModel) => {
    const lii = []
    if (dcv.withDate) {
        lii.push('import java.time.LocalDate;')
    }
    if (dcv.withDateTime) {
        lii.push('import java.time.LocalDateTime;')
    }
    if (dcv.childs !== undefined) {
        lii.push('import java.util.Set;')
    }
    if (dcv.withBigDecimal !== undefined) {
        lii.push('import java.math.BigDecimal;')
    }

    return `${lii.join("\n")}
    `
}


export function doJclzz(dck:DCJsModelKey, dcv:DCJsModel) {
    const ps_s = doPs0(dck, dcv)
    const parents_s = doParents0(dck, dcv)
    const childs_s = doChilds0(dck, dcv)
    const imps = addImports(dcv)

    

    return `
${imps}  
import org.lonpe.model.AbstractDcLon;
import org.lonpe.model.IDcLon;   

public class ${dck} extends AbstractDcLon implements IDcLon{

    public ${dck}(){
        super();
    }

    ${ps_s}

    ${parents_s}

    ${childs_s}
      
}`
}


export function createUniqueParentSqlIndex(dck:DCJsModelKey, dcv:DCJsModel):Array<string> {
    const lll:Array<string> = []
    if (dcv.parentsRestrict) {
        const idx_n = dcv.parentsRestrict.join('_w_')

        const llp:Array<string> = []
        dcv.parentsRestrict.forEach((pn0) => {
            const parents = dcv.parents
            if(parents){
                const idxp:number = parents.findIndex((p) => {
                    return p.n === pn0
                })
                if (idxp > -1) {
                    const dcpp = parents[idxp]
                    const colName = dcpp.colName ? dcpp.colName :"-"                   
                    llp.push(colName)
                }
            }

        })


        const vidx:string = llp.join(",")

        lll.push(`
CREATE UNIQUE INDEX idx_uq_${idx_n} ON ${dcv.tableName}( ${vidx}); 
 `)
    }
    return lll
}


export function doInsertSql(dck:DCJsModelKey, dcv:DCJsModel) {
    const ps = dcv.ps


    const lparams:Array<string> = []
    const lvals:Array<string> = []
    let i = 1
    if (ps !== undefined) {
        ps.forEach((p) => {
            const colName = p.colName ? p.colName: "-"
            lparams.push(colName)
            lvals.push("$" + (i++))
        })
    }

    const parents = dcv.parents
    if (parents !== undefined) {
        parents.forEach(p => {
            lparams.push(p.dcSqlAlias + "_id")
            lvals.push("$" + (i++))
        })
    }


    return `INSERT INTO ${dcv.tableName}(${lparams.join(",")}) VALUES (${lvals.join(",")}) returning id,pkey`

}

export function doUpdateSql(dck:DCJsModelKey, dcv:DCJsModel, fld:string) {
    const ps = dcv.ps


    const lparams:Array<string> = []
    const lparams2:Array<string> = []
    const lvals = []
    const lvals2 = []
    let i = 1
    if (ps !== undefined) {
        ps.filter(p => p.n !== 'pkey').forEach((p) => {
            const v = `${p.colName} = ` + "$" + (i++);
            lparams.push(v)
            lparams2.push(v)
            //        lvals.push("$"+(i++))
        })
    }
/*
    const parents = dcv.parents
    if (parents !== undefined) {
        parents.forEach(p => {
            lparams2.push(p.dcSqlAlias + "_id = $" + (i++))
            lvals2.push("$" + (i++))
        })
    }
*/
    return `UPDATE ${dcv.tableName} SET ${lparams.join(",")} WHERE ${fld} = $${i} returning id,pkey`

}

export function doCreateTableIdSequence(dck:DCJsModelKey, dcv:DCJsModel) {
    return "CREATE SEQUENCE " + dcv.tableName + "_id_seq;"
}


export function doCreateTable(dck:DCJsModelKey, dcv:DCJsModel) {

    const tblFlds = [` id bigint DEFAULT nextval('${dcv.tableName}_id_seq'::regclass) NOT NULL `]
    const ps = dcv.ps

    function fld(pcn:string, sqlt:string, nll:string, dv:string) {
        return `${pcn} ${sqlt} ${nll} ${dv}`
    }

    if (ps !== undefined) {
        ps.forEach((p) => {
            const null0 = (p.nullable === undefined || !p.nullable) ? ' NOT NULL ' : ''
            const defaultVal = (p.defaultVal !== undefined ? (` DEFAULT ${p.defaultVal} `) : "")
            const colName= p.colName ? p.colName : ""
            const colType= p.colType ? p.colType : ""
            tblFlds.push(fld(colName, colType, null0, defaultVal))
        })
    }

    const parents = dcv.parents
    if (parents !== undefined) {
        parents.forEach(p => {
            const null0 = (p.nullable === undefined || !p.nullable) ? ' NOT NULL' : ''
            tblFlds.push(`${p.colName} ${p.colType} ${null0}`)
        })
    }

    const l2 = []
    l2.push(`
    
--- TABLE  ${dck} 

CREATE TABLE ${dcv.tableName}  ( ${tblFlds.join(",\n ")}  );      
CREATE UNIQUE INDEX ${dcv.tableName}_udix_id ON public.${dcv.tableName} USING btree (id);

`)

    if (ps !== undefined) {
        const ps00 = ps.filter(p => {
            return p.n !== 'pkey'
        })
        l2.push(`CREATE UNIQUE INDEX ${dcv.tableName}_uidx_pkey ON public.${dcv.tableName} USING btree (pkey);`)

        ps00.filter(p => {
            return p.unique === true && !p.inList
        }).forEach((p) => {
            l2.push(`CREATE UNIQUE INDEX ${dcv.tableName}_uidx_${p.colName} ON public.${dcv.tableName} USING btree (${p.colName});`)
        })
        ps00.filter(p => {
            return p.inList !== undefined
        }).forEach((p) => {
            l2.push(`CREATE INDEX ${dcv.tableName}_idx_${p.colName} ON public.${dcv.tableName} USING btree (${p.colName});`)
        })
        ps00.filter(p => {
            return p.withIndex !== undefined && p.unique !== true && p.inList===undefined
        }).forEach((p) => {
            l2.push(`CREATE INDEX ${dcv.tableName}_idx_${p.colName} ON public.${dcv.tableName} USING btree (${p.colName});`)
        })
     /*   if (dcv.pcn !== undefined) {
            l2.push(`-- INDEX FOR PC  ${dcv.pcn} `)
            const pc = dcv.ps[dcv.pc]
            l2.push(`CREATE INDEX ${dcv.tableName}_idx_${pc.colName} ON public.${dcv.tableName} USING btree (${pc.colName});`)
        }*/

    }

    l2.push(" ")
    return l2.join("\n")

}





export function doSqlConditionsPs(dck:DCJsModelKey, dcv:DCJsModel) {
    const ps = dcv.ps
    const l0 = []


    l0.push("//*---PKEY ---")
    l0.push(`       
    slcb.doIlPSimple2( "pkey", "${dcv.tableName}_pkey");
    slcb.doEqInPSimple( "pkey", "${dcv.tableName}_pkey");`)

    if (ps !== undefined) {

        if (dcv.pc && dcv.ps && dcv.pcn !== undefined) {
            const pc = dcv.ps[dcv.pc]
            l0.push(`
//*---PC ---" + ${pc.n}
    slcb.doIlPSimple2( "${pc.n}", "${dcv.tableName}_${pc.colName}");
    slcb.doEqInPSimple( "${pc.n}", "${dcv.tableName}_${pc.colName}");            `);
        }


        ps.filter(p => p.isPassword !== true && p.n !== dcv.pcn && p.n !== 'pkey').forEach((p) => {
            if (p.t === "String") {
                if (p.withIndex === true) {
                    l0.push(` 
// withIndex ${p.withIndex}
    slcb.doIlPSimple2( "${p.n}", "${dcv.tableName}_${p.colName}");
    slcb.doEqInPSimple( "${p.n}", "${dcv.tableName}_${p.colName}");                    `)
                }
                if (p.inList !== undefined) {
                    l0.push(`
    slcb.doEqInPSimple( "${p.n}", "${dcv.tableName}_${p.colName}");                    `)
                }

            } else if (p.t === "Integer" || p.t === "Integer" || p.t === "Integer") {
                l0.push(`   
    slcb.doGEPSimple${p.t}( "${p.n}", "${dcv.tableName}_${p.colName}");
    slcb.doLTPSimple${p.t}( "${p.n}", "${dcv.tableName}_${p.colName}");                `)
            } 


        })


    }
    return l0.join("")

}

