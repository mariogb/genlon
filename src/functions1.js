const model = require('./modelo.js').model
const c = require('./CommonLon')

//const doSimpleMap = require('./FunLones.js').doSimpleMap


exports.createUniqueParentSqlIndex = c.createUniqueParentSqlIndex

exports.doJclzz = function (dck, dcv) {
    return c.doJclzz(dck,dcv)    
}

function doInsertSql(dck, dcv) {
   return c.doInsertSql(dck,dcv)
}

function doUpdateSql(dck, dcv, fld) {
    return c.doUpdateSql(dck,dcv,fld)
}


function doSqlConditionsPs(dck, dcv) {
 return c.doSqlConditionsPs(dck,dcv)
}


///

/*
    sz0.applyCalcFieldName("sum(invoice_line_in.ask_quantity*invoice_line_in.price) as sum_subtotal","sum_subtotal");
    sz0.applyCalcFieldName("avg(invoice_line_in.ask_quantity*invoice_line_in.price) as avg_subtotal","avg_subtotal");

*/
function doSumNumsZtat(dck, dcv) {
    const ps = dcv.ps;
    if (!ps) {
        return ""
    }
    return ps.filter((p0) => {
        return (p0.t === "Integer" || p0.t === "Float" || p0.t === "Long" || p0.t === "Double" || p0.t === "BigDecimal");
    }).filter((p0)=>{return p0.inZtat}).map((p0) => {

        const inZtat = p0.inZtat
        const lZtat = []
        inZtat.forEach((zv)=>{
            lZtat.push(`
            sz0.applyFieldName("${zv}(${dcv.tableName}.${p0.colName}) as ${zv}_${p0.colName}_${dcv.tableName}","${zv}_${p0.n}"); `)
        })

        return lZtat.join("");
    }).join("")


}

function doVer2aZtatZInfosObjects(dck, dcv) {

    const parents = dcv.parents
    if (parents === undefined) {
        return {
            defs: [],
            builds: []
        }
    }


    //const simpleMap1 = doSimpleMap(dck, dcv)

    const l_ = []
    const l2_ = []
    const l3_ = []
    const l_defs = [];
    const l2_defs = [];
    const l3_defs = [];

    parents.forEach(p => {
        const dcv1 = model[p.t]
        let pc1 = "null"
        if (dcv1.pc > -1) {
            pc1 = dcv1.ps[dcv1.pc].n
        }

    });

    parents.forEach(p => {
        const dcv1 = model[p.t]
        const parents2 = dcv1.parents
        if (parents2 !== undefined) {
            parents2.forEach(p2 => {
                const dcv2 = model[p2.t]
                let pc2 = "null"

                if (dcv2.pc > -1) {
                    pc2 = dcv2.ps[dcv2.pc].n
                }


            })
        }
    });


    parents.forEach(p1 => {
        const dcv1 = model[p1.t]
        const parents2 = dcv1.parents
        if (parents2 !== undefined) {
            parents2.forEach(p2 => {

                const dcv2 = model[p2.t]
                const parents3 = dcv2.parents
                if (parents3) {
                    parents3.forEach(p3 => {
                        const dcv3 = model[p3.t]
                        let pc3 = "null"
                        if (dcv3.pc > -1) {
                            pc3 = dcv3.ps[dcv3.pc].n
                        }
                        const n = `z${p3.nUp}From${p2.nUp}From${p1.nUp}`
                        const n2 = `z${p2.nUp}From${p1.nUp}`


                    })
                }
            })
        }
    })




    return {
        defs: l_defs.concat(l2_defs).concat(l3_defs),
        builds: l_.concat(l2_).concat(l3_)
    }

}


function doVer2aZtat(dck, dcv) {
    const parents = dcv.parents
    if (parents === undefined) {
        return ""
    }

    const l_ = []
    const l2_ = []
    const l3_ = []

    l_.push(`
//level 1
    `);
    const usado = {}
    parents.forEach(p => {
        //  if (usado[p.n] === undefined) {
        const dcv1 = model[p.t]
        let pc1 = "null"
        if (dcv1.pc > -1) {
            pc1 = dcv1.ps[dcv1.pc].n
        }
        // l_.push(`sz0.applyG1("${p.colName}", "${p.n}",  "${dcv1.tableName}","${pc1}");   `)
        l_.push(`         
    sz0.applyG1(mz1.get("z${p.nUp}"))   ;      `)
        usado[p.n] = 1
        //   }//  sz0.applyG1(mz1.get("zTheFligth"));

    })
    l_.push(`
//level 2    `);
    parents.forEach(p => {
        const dcv1 = model[p.t]
        const parents2 = dcv1.parents
        if (parents2 !== undefined) {
            parents2.forEach(p2 => {

                 if (usado[p2.n] === undefined) {
                const dcv2 = model[p2.t]
                let pc2 = "null"

                if (dcv2.pc > -1) {
                    pc2 = dcv2.ps[dcv2.pc].n
                }
                const n = `z${p2.nUp}:${p.nUp}`
                l_.push(`
    sz0.applyG2(mz2.get("${n}"));                           `)
                usado[p2.n] = 1
                  }

            })
        }
    });

    l_.push(`
//level 3    `);
    parents.forEach(p1 => {
        const dcv1 = model[p1.t]
        const parents2 = dcv1.parents
        if (parents2 !== undefined) {
            parents2.forEach(p2 => {

                const dcv2 = model[p2.t]
                const parents3 = dcv2.parents
                if (parents3) {
                    parents3.forEach(p3 => {

                        if (usado[p3.n] === undefined) {
                        const dcv3 = model[p3.t]
                        let pc3 = "null"
                        if (dcv3.pc > -1) {
                            pc3 = dcv3.ps[dcv3.pc].n
                        }
                        const n2 = `z${p2.nUp}From${p1.nUp}`
                        const n3 = `z${p3.nUp}:${p2.nUp}:${p1.nUp}`
                        l_.push(`
        sz0.applyG3(mz3.get("${n3}"));               `)
                        usado[p3.n] = 1
                        }

                    })

                }

            })
        }
    });



    return l_.join("")


}

function doVer2a(dck, dcv) {

    const parents = dcv.parents
    if (parents === undefined) {
        return ""
    }
    const used = {}
    //change to forEach
    const l1 = parents.map(p => {
        used[p.n] = 1
        const dcv1 = model[p.t]

        let s = ""
        s += `
        slcb.doIlPSimple2( "${p.n}_pkey", "${p.dcSqlAlias}_pkey");
        slcb.doEQPSimple2( "${p.n}_pkey", "${p.dcSqlAlias}_pkey");
        slcb.doInLongCondition("${p.n}_id", "${p.dcSqlAlias}_id");  
//${p.t} ${model[p.t].pc}        --`
        if (dcv1.pc > -1) {
            const pc1 = dcv1.ps[dcv1.pc]
            s += `
        slcb.doIlPSimple2( "${p.n}_${pc1.n}", "${p.dcSqlAlias}_${pc1.colName}");    
        `
        }

        return s
    })


    parents.forEach(p => {
        const dcv1 = model[p.t]

        const parents2 = dcv1.parents
        if (parents2 !== undefined) {
            parents2.forEach(p2 => {

                if (used[p2.n] === undefined) {
                    used[p2.n] = 1
                    const dcv2 = model[p2.t]

                    const p2Name = p2.n
                    const p2Alias = p2.dcSqlAlias

                    l1.push(`
        slcb.doIlPSimple2( "${p2Name}_pkey", "${p2Alias}_pkey");
        slcb.doEQPSimple2( "${p2Name}_pkey", "${p2Alias}_pkey");
        slcb.doInLongCondition("${p2Name}_id", "${p2Alias}_id");`)
                    l1.push(`
//${p2.t} ${model[p2.t].pc}`)
                    if (dcv2.pc > -1) {
                        const pc2 = dcv2.ps[dcv2.pc]
                        l1.push(`
        slcb.doIlPSimple2( "${p2Name}_${pc2.n}", "${p2Alias}_${pc2.colName}"); `)

                    }

                    const parents3 = dcv2.parents
                    if (parents3 !== undefined) {
                        parents3.forEach(p3 => {
                            if (used[p3.n] === undefined) {
                                used[p3.n] = 1

                                const dcv3 = model[p3.t]


                                const p3Name = p3.n
                                const p3Alias = p3.dcSqlAlias


                                l1.push(`
        slcb.doIlPSimple2( "${p3Name}_pkey", "${p3Alias}_pkey");
        slcb.doEQPSimple2( "${p3Name}_pkey", "${p3Alias}_pkey");
        slcb.doInLongCondition("${p3Name}_id", "${p3Alias}_id"); `)

                            }

                        })
                    }


                }


            })
        }

    })

    return l1.join("")

}



function fillObjectFromJson(dck, dcv) {
    const l0 = []
    const ps = dcv.ps
    if (ps !== undefined) {
        ps.filter((p)=>{return p.isPassword!==true}).forEach((p) => {

            if (p.t === "LocalDate") {
                l0.push(`        
                ${dcv.dcname}.set${p.nUp}(LocalDate.parse(js.getString("${p.n}")));`)
            } else if (p.t === "LocalDateTime") {
                l0.push(`        
                ${dcv.dcname}.set${p.nUp}(LocalDateTime.parse(js.getString("${p.n}")));`)
            } else if (p.t === "BigDecimal") {
                l0.push(`        
                ${dcv.dcname}.set${p.nUp}(new BigDecimal(js.getString("${p.n}")));`)
            } else {
                l0.push(`        
                ${dcv.dcname}.set${p.nUp}(js.get${p.t}("${p.n}"));`)
            }
        })
    }
    const parents = dcv.parents
    if (parents !== undefined) {
        parents.forEach(p => {
            l0.push(`        
            ${dcv.dcname}.setId(js.getLong("${p.n}_id"));`)
        })
    }

    return (l0.join(""))

}


function fillObjectFromRow(dck, dcv) {

    const used = {}

    function doOnParent(p00, dcObj) {


        const pName = p00.n;
        const pFld = p00.dcSqlAlias;


        let s = ""
        if (dcObj.pc > -1) {
            const pc = dcObj.ps[dcObj.pc]
            s += `
        ${pName}.set${pc.nUp}(r.getString("${pFld}_${pc.colName}"));`
        }

        return `
        final ${p00.t} ${pName} = new ${p00.t}();
        ${pName}.setId(r.getLong("${pFld}_id"));
        ${pName}.setPkey(r.getString("${pFld}_pkey"));
        ${s}
        ${dcv.dcname}.set${p00.nUp}(${pName});
        `
    }

    function doOnParent2(p00, dcObj, p11) {

        const pName2 = p00.n;
        const pFld2 = p00.dcSqlAlias;


        const pName = p11.n;
        const pFld = p11.dcSqlAlias;

        let s = ""
        if (dcObj.pc > -1) {
            const pc = dcObj.ps[dcObj.pc]
            s += `${pName2}.set${pc.nUp}(r.getString("${pFld2}_${pc.colName}"));\n`
        }
        return `
        final ${p00.t} ${pName2} = new ${p00.t}();
        ${pName2}.setId(r.getLong("${pFld2}_id"));
        ${pName2}.setPkey(r.getString("${pFld2}_pkey"));
        ${s} 
        ${pName}.set${p00.nUp}(${pName2}); `
    }

    const l0 = []
    const ps = dcv.ps
    const tb0 = dcv.tableName

    l0.push(` ${dcv.dcname}.setId(r.getLong("${tb0}_id"));`)
    if (ps !== undefined) {
        ps.filter(p => {
            return p.isPassword !== true
        }).forEach((p) => {

            if (p.t === "LocalDate") {
                l0.push(`         
                ${dcv.dcname}.set${p.nUp}(r.getLocalDate("${tb0}_${p.colName}"));              `)
            } else {
                l0.push(`         
                ${dcv.dcname}.set${p.nUp}(  r.get${p.t}("${tb0}_${p.colName}"));              `)
            }

        })
    }
    const parents = dcv.parents

    if (parents !== undefined) {
        parents.forEach(p => {
            const dcv1 = model[p.t]

            l0.push(doOnParent(p, dcv1))
            used[p.n] = 1

        })
    }


    if (parents !== undefined) {
        parents.forEach(p => {

            const dcv1 = model[p.t]
            const parents2 = dcv1.parents
            if (parents2 !== undefined) {
                parents2.forEach(p2 => {
                    if (used[p2.n] === undefined) {
                        used[p2.n] = 1
                        const dcv2 = model[p2.t]
                        l0.push(doOnParent2(p2, dcv2, p))
                        used[p2.n] = 1

                    }
                })
            }
        })
    }


    return (l0.join(""))

}


function doFillTupleUpdate(dck, dcv) {

    const l0 = []
    const ps = dcv.ps
    if (ps !== undefined) {
        ps.filter(p => {
            return p.n !== 'pkey'
        }).forEach((p) => {

            if (p.t === "LocalDate") {
                //t.addLocalDate(toLocalDate(js.getString("beginDate")));
                l0.push(`        t.addLocalDate(LocalDate.parse(js.getString("${p.n}")));`)
            } else {
                // l0.push(`        t.add${p.t}(js.get${p.t}("${p.n}"));`)
                l0.push(`fT${p.t}("${p.n}", js, t);`);
            }

        })
    }
    const parents = dcv.parents
    if (parents !== undefined) {
        parents.forEach(p => {
            // l0.push(`//        t.addLong(js.getLong("${p.n}_id"));`)
            l0.push(`
            //     fTLong("${p.n}_id",js,t);`)
        })
    }
    l0.push('fTLong("id",js,t);')

    return (l0.join("\n"))

}



function fillObjectWithParentsIds(dck, dcv) {
    const l0 = []
    const parents = dcv.parents
    if (parents !== undefined) {
        parents.forEach(p => {
            l0.push(`      
            final Map<String, Long> ${p.n} = mapParents.get("${p.n}");
            final Long ${p.n}_id = ${p.n}.get((String)obj.get("${p.n}_pkey"));
            obj.put("${p.n}_id", ${p.n}_id);`)

        })
    }

    return l0.join("\n")

}

function doFillTupleMapObj(dck, dcv) {

    const l0 = []
    const ps = dcv.ps
    if (ps !== undefined) {
        ps.forEach((p) => {
            if (p.t === "LocalDate") {                
                l0.push(`  
    t.addLocalDate((LocalDate)obj.get("${p.n}"));`)
            } else {
                l0.push(`
    fT${p.t}("${p.n}", obj, t);`);
            }
        })
    }
    const parents = dcv.parents
    if (parents !== undefined) {
        parents.forEach(p => {
            // l0.push(`        t.addLong(js.getLong("${p.n}_id"));`)
            l0.push(`
    fTLong("${p.n}_id",obj,t);`)
        })
    }

    return (l0.join("\n"))

}

function doFillTuple(dck, dcv) {

    const l0 = []
    const ps = dcv.ps
    if (ps !== undefined) {
        ps.forEach((p) => {

            if (p.t === "LocalDate") {
                //t.addLocalDate(toLocalDate(js.getString("beginDate")));
                l0.push(`
    t.addLocalDate(LocalDate.parse(js.getString("${p.n}")));`)
            } else {
                // l0.push(`        t.add${p.t}(js.get${p.t}("${p.n}"));`)
                l0.push(`
    fT${p.t}("${p.n}", js, t);`);
            }

        })
    }
    const parents = dcv.parents
    if (parents !== undefined) {
        parents.forEach(p => {
            // l0.push(`        t.addLong(js.getLong("${p.n}_id"));`)
            l0.push(`     
    fTLong("${p.n}_id",js,t);`)
        })
    }

    return (l0.join(""))

}

function doFillTupleDC(dck, dcv) {
    const l0 = []
    const ps = dcv.ps
    if (ps !== undefined) {
        ps.forEach((p) => {

            if (p.t === "LocalDate") {
                //t.addLocalDate(toLocalDate(js.getString("beginDate")));
                l0.push(`
    t.addLocalDate( dc0.get${p.nUp}()  );`)
            } else {
                l0.push(`        
    t.add${p.t}(dc0.get${p.nUp}());`)
            }

        })
    }
    const parents = dcv.parents
    if (parents !== undefined) {
        parents.forEach(p => {
            l0.push(`   
    if(dc0.get${p.nUp}()!=null){
       t.addLong(dc0.get${p.nUp}().getId());
    }`)
        })
    }

    return (l0.join(""))


}


function doFillTupleUpdateDC(dck, dcv) {
    const l0 = []
    const ps = dcv.ps
    if (ps !== undefined) {
        ps.filter(p => {
            return p.n !== 'pkey'
        }).forEach((p) => {

            if (p.t === "LocalDate") {
                l0.push(`        
    t.addLocalDate( dc0.get${p.nUp}()  );`)
            } else {
                l0.push(`
    t.add${p.t}(dc0.get${p.nUp}());`)
            }

        })
    }
    const parents = dcv.parents
    if (parents !== undefined) {
        parents.forEach(p => {
            l0.push(`   
//      if(dc0.get${p.nUp}()!=null){
//            t.addLong(dc0.get${p.nUp}().getId());
//      }`)
        })
    }
    //l0.push(`t.addLong(dc0.getId());`)
    l0.push(`
    t.addLong(dc0.getId());
    `)
    return (l0.join(""))


}

function doModelChilds(dck, dcv) {
    const used0 = {};

    function toNull(vv) {
        if (vv === undefined) {
            return null
        }
        return `"${vv}"`
    }

    function v1(p1) {
        if (p1.onRelation) {
            return `
//ON RELATION ${p1.onRelation}    
            applyOtm(otm,"${p1.n}","${p1.tDw}","${p1.onRelation}"); 
                `
        } else {
            return `
        applyOtm(otm,"${p1.n}","${p1.tDw}"); 
                `
        }
    }

    function v2(p2, p1) {
        return `
        applyOtm2(otm2,"${p2.n}","${p2.tDw}","${p1.n}",${toNull(p2.onRelation)},${toNull(p1.onRelation)}); 
        `
    }

    function v3(p3, p2, p1) {
        return `
        applyOtm3(otm3,"${p3.n}","${p3.tDw}","${p2.n}",${toNull(p3.onRelation)},${toNull(p2.onRelation)},${toNull(p1.onRelation)}); 
        `
    }

    const childs = dcv.childs
    const l0 = []
    const l1 = []
    const l2 = []

    if (childs !== undefined) {

        l0.push(`
        final JsonArray otm = new JsonArray();`)
        childs.forEach(p => {
            l0.push(v1(p))
        })
        l0.push(`
/** OTM ON MODEL  **/
        dcModel.put("otm",otm);  `)

        childs.forEach(p => {
            const dcvch1 = model[p.t]
            const childs1 = dcvch1.childs
            if (childs1 !== undefined) {
                childs1.forEach(p1 => {
                    //l1.push(v(p1, p, 2))
                    l1.push(v2(p1, p))
                });
            }
        });

        childs.forEach(p => {
            const dcvch1 = model[p.t]
            const childs1 = dcvch1.childs
            if (childs1 !== undefined) {
                childs1.forEach(p1 => {
                    const dcvch2 = model[p1.t]
                    const childs2 = dcvch2.childs
                    if (childs2 !== undefined) {
                        childs2.forEach(p2 => {
                            //l2.push(v(p2, p1, 3))                            
                            l2.push(v3(p2, p1, p))
                        });
                    }
                });
            }
        });
    }

    if (l1.length > 0) {
        l0.push(`
/** OTM 2  **/
        final JsonArray otm2 = new JsonArray();`)
        l0.push(l1.join("\n"));
        l0.push(`
/** OTM 2  ON MODEL**/
        dcModel.put("otm2",otm2);
        `)
    }

    if (l2.length > 0) {
        l0.push(`
/** OTM 3  **/
        final JsonArray otm3 = new JsonArray();`)
        l0.push(l2.join("\n"));
        l0.push(`
/** OTM 3  ON MODEL**/
        dcModel.put("otm3",otm3);
        `)
    }
    return l0.join("\n")
}


function doNames(dck, dcv) {
    const ps = dcv.ps
    const tb0 = dcv.tableName
    const l0 = []
    const used = {}

    //AAABBB
    function doDC1(p) {
        const l_ = []
        const dcv1 = model[p.t]
        l_.push(`
//(1)  ${p.n}
    doFieldMT0("${tb0}","${p.n}", "${p.dcSqlAlias}");  `)
        l_.push(`
    final JsonObject ${p.n} =  doMto("${p.n}","${p.tDw}");        `)
        let pc1V = "null"
        if (dcv1.pc && dcv1.pc > -1) {
            pc1V = dcv1.pcn
            const pc1 = dcv1.ps[dcv1.pc]
            l_.push(`   
    names.add("${p.n}_${pc1V}");
    sortMapFields.put( "${p.n}_${pc1V}", "${p.dcSqlAlias}_${pc1.colName}");                
    ${p.n}.put("pc","${pc1.n}");          `)
        }

        if (p.setBySys !== undefined) {
            l_.push(`
    ${p.n}.put("setBySys","${p.setBySys}");           `)
        }
        ////////////////////MODEL            
        if (p.onForm !== undefined) {
            l_.push(`
    ${p.n}.put("onForm","${p.onForm}");           `)
        }
        l_.push(`
    mto.add(${p.n});
        `);

        l_.push(`
    //1  ${p.dcSqlAlias}  -- ${p.colName}
    final ZtatUnitInfoLon z${p.nUp} = new ZtatUnitInfoLon("${p.colName}", "${p.n}",  "${dcv1.tableName}","${pc1V}","${p.dcSqlAlias}");
    mz1.put("z${p.nUp}", z${p.nUp});    `)


        return l_.join("\n")
    }

    function doDC2(level, p2, pp0) {
        const l_ = []

        const n00 = p2.n;
        const n00Alias = p2.dcSqlAlias;

        l_.push(`
//(${level})  ${n00}   ${p2.n}  
    names.add("${n00}_id");          
    names.add("${n00}_pkey");`)

        const nn = `${p2.n}From${pp0.nUp}`

        l_.push(`
    final JsonObject ${nn} =   doMto2("${n00}","${p2.tDw}","${pp0.n}");        `)

        const dcv2 = model[p2.t]
        let pc2V = "null"
        if (dcv2.pc > -1) {
            const pc2 = dcv2.ps[dcv2.pc]
            pc2V = pc2.n
            l_.push(`   
    names.add("${n00}_${pc2.n}");           
    sortMapFields.put( "${n00}_${pc2.n}", "${n00Alias}_${pc2.colName}");  
    ${nn}.put("pc","${pc2.n}");    `)

        }

        l_.push(`         
    mto${level}.add(${nn});        `);

        const n = `z${p2.nUp}:${pp0.nUp}`
        const laVar = `z${p2.nUp}From${pp0.nUp}`
        l_.push(`
    final ZtatUnitInfoLon2 ${laVar} = new ZtatUnitInfoLon2(z${pp0.nUp}, "${p2.colName}", "${p2.n}",  "${dcv2.tableName}","${pc2V}","${p2.dcSqlAlias}");
    mz2.put("${n}",${laVar});`)

        return l_.join("\n")
    }


    function doDC3(level, p2, pp1, pp0) {
        const l_ = []
        const n00 = p2.n;
        const n00Alias = p2.dcSqlAlias;

        const n11 = pp1.n;
        const n11Alias = pp1.dcSqlAlias;




        l_.push(`
//(${level})   ${p2.n}   
    names.add("${n00}_id");          
    names.add("${n00}_pkey");`)

        const nn = `${p2.n}From${pp1.nUp}From${pp0.nUp}`

        l_.push(`
    final JsonObject ${nn} =   doMto2("${n00}","${p2.tDw}","${n11}");        `)

        const dcv2 = model[p2.t]
        let pc2V = "null"
        if (dcv2.pc > -1) {
            const pc2 = dcv2.ps[dcv2.pc]
            pc2V = pc2.n
            l_.push(`   
    names.add("${n00}_${pc2.n}");            
    sortMapFields.put( "${n00}_${pc2.n}", "${n00Alias}_${pc2.colName}"); 
    ${nn}.put("pc","${pc2.n}");     `)

        }

        l_.push(`         
    mto${level}.add(${nn});        `);

        const n = `z${p2.nUp}:${pp1.nUp}:${pp0.nUp}`
        const laVar = `z${p2.nUp}Fr${pp1.nUp}Fr${pp0.nUp}`
        l_.push(`
     
    
    final ZtatUnitInfoLon3 ${laVar} = new ZtatUnitInfoLon3(z${pp1.nUp}From${pp0.nUp}, "${p2.colName}", "${p2.n}",  "${dcv2.tableName}","${pc2V}","${p2.dcSqlAlias}");
    

    mz3.put("${n}",${laVar});    `)


        return l_.join("\n")
    }




    function doModelPropertyInJavaJsonObject(p) {


    }

    l0.push(`
    dcModel.put("dc", "${dcv.dcname}");

//ID 
    names.add("id");`)
    l0.push(`
    sortMapFields.put("id","${tb0}_id");`)
    if (ps !== undefined) {

        // 
        l0.push(`
    final JsonArray ps = new JsonArray();   `)

        ps.filter(p => {
            return p.isPassword !== true
        }).forEach((p) => {

            let withSort0 = ""
            if (p.t !== "String" || (p.t === "String" && p.size < 129)) {
                withSort0 = "Sort"
            }
            l0.push(` 
//${p.n}
    doField${withSort0}("${p.n}","${p.colName}","${tb0}");               `)


            if (p.unique === true) {
                l0.push(`   
//Used to map error on index to source property because IS Unique
    insertMapFields.put("${tb0}.${tb0}_uidx_${p.colName}","${p.n}");  `)
            }


            l0.push(`
//Create property ${p.n}       
    final JsonObject ${p.n} = ps${p.t}("${p.n}",${p.nullable !== true});`)


            if (p.unique === true) {
                ////////////////////MODEL                    
                l0.push(`
// IS Unique     
    ${p.n}.put("uq",true);                    `);

            }
            ////////////////////MODEL
            if (p.inList !== undefined) {
                let sInList = `
    final JsonArray ${p.n}InList = new JsonArray();
                `
                sInList += p.inList.map(e00 => {
                    return `${p.n}InList.add("${e00}"); `
                }).join("\n")
                sInList += `
    ${p.n}.put("inList",${p.n}InList );                `
                l0.push(sInList);

            }
            ////////////////////MODEL
            if (p.min !== undefined) {
                l0.push(` 
    ${p.n}.put("min", ${p.min}); `)
            }
            if (p.max !== undefined) {
                l0.push(` 
    ${p.n}.put("max", ${p.max}); `)
            }
            if (p.n === dcv.pcn) {
                l0.push(`  
//PC
    dcModel.put("pc","${dcv.pcn}");  `)
            }
            if (p.withIndex !== undefined) {
                l0.push(`
// hasIndex 
    ${p.n}.put("withIndex",true);  `)
            }
            if (p.setBySys !== undefined) {
                l0.push(` 
//Set by system
    ${p.n}.put("setBySys","${p.setBySys}");  `)
            }

            l0.push(` 
    ps.add(${p.n});`)

        })

        ////////////////////MODEL
        l0.push(`
//Add ps to model            
    dcModel.put("ps", ps);        `);

        ////////////////////MODEL
        const l_pws = ps.filter(p => {
            return p.isPassword === true
        }).map((p) => {
            return `
//Add password field type
    final JsonObject ${p.n} = new JsonObject().put("n","${p.n}");
    pspw.add(${p.n});      `
        })
        if (l_pws.length > 0) {
            l0.push(`  
    final JsonArray pspw = new JsonArray();
    ${l_pws.join("\n")}
    dcModel.put("pspw",pspw);   `)
        }



    }


    let addedMto2 = false;
    let addedMto3 = false;

    const parents = dcv.parents
    if (parents !== undefined) {

        l0.push(`
    final JsonArray mto = new JsonArray();      `)

        /////aaaaaaa111

        parents.forEach(p => {

            const dcv1 = model[p.t]
            l0.push(doDC1(p))
            used[p.n] = 1
        })

        l0.push(`
    dcModel.put("mto",mto);     `)

        ///////bbbbbbb111

        /////aaaaaaa222
        let idx = 0
        parents.forEach(p => {

            const dcv1 = model[p.t]

            const parents2 = dcv1.parents

            if (parents2 !== undefined) {

                if (!addedMto2) {
                    l0.push(`
    final JsonArray mto2 = new JsonArray();        `)
                    addedMto2 = true
                }

                parents2.forEach(p2 => {


                    if (used[p2.n] === undefined) {

                        const dcv2 = model[p2.t]
                        l0.push(doDC2(2, p2, p))
                        used[p2.n] = 1

                    }
                })
            } //if parents2
            idx++
        })

        if (addedMto2) {
            l0.push(`
    dcModel.put("mto2",mto2);    `)
        }



        ///////bbbbbbb222


        /////aaaaaaa333
        idx = 0
        parents.forEach(p => {
            const dcv1 = model[p.t]
            const parents2 = dcv1.parents
            if (parents2 !== undefined) {

                let idx2 = 0
                parents2.forEach(p2 => {

                    const dcv2 = model[p2.t]

                    const parents3 = dcv2.parents
                    if (parents3 !== undefined) {

                        if (!addedMto3) {
                            l0.push(`
    final JsonArray mto3 = new JsonArray();           `)
                            addedMto3 = true
                        }

                        parents3.forEach(p3 => {

                            if (used[p3.n] === undefined) {
                                const dcv3 = model[p3.t]


                                l0.push(doDC3(3, p3, p2, p))
                                used[p3.n] = 1
                            }

                        })
                    }
                    idx2++;



                })
            } //if parents2
            idx++
        })
        if (addedMto3) {
            l0.push(`
    dcModel.put("mto3",mto3);       `)
        }

        ///////bbbbbbb3333




    }

    return (l0.join("\n"))
}


function doFillToJsonObject(dck, dcv) {

    const ps = dcv.ps
    const tb0 = dcv.tableName
    const l0 = []
    l0.push(`jso.put("id",o.getId() );`)
    if (ps !== undefined) {
        ps.filter(p => {
            return p.isPassword !== true
        }).forEach((p) => {
            if (p.t === 'LocalDate') {
                l0.push(`        jso.put("${p.n}", o.get${p.nUp}() );`)
            } else {
                l0.push(`        jso.put("${p.n}",  o.get${p.nUp}() );`)
            }
        })
    }
    const parents = dcv.parents
    if (parents !== undefined) {
        parents.forEach(p => {

            //XXXX   
            const ll_ = []
            ll_.push(`     jso.put("${p.n}_id", ${p.n}.getId()); `)
            ll_.push(`     jso.put("${p.n}_pkey", ${p.n}.getPkey());      `)

            const dcv1 = model[p.t]
            if (dcv1.pc > -1) {
                const pc1 = dcv1.ps[dcv1.pc]

                ll_.push(`     jso.put("${p.n}_${pc1.n}", ${p.n}.get${pc1.nUp}());      `)
            }
            l0.push(`
            final ${p.t} ${p.n} = o.get${p.nUp}();
            if(${p.n}!=null){
                ${ll_.join("\n")}
            }
            `)


        })
    }

    return (l0.join("\n"))

}

function doFillToJsonArray(dck, dcv) {
    return doFillToJsonArray00(dck, dcv, 1)
}

function doFillExcelRow(dck, dcv) {
    return doFillToJsonArray00(dck, dcv, 2)
}


function doFillExcelRowH(dck, dcv) {

    return `
    final  LinkedHashMap<String,String> m = new LinkedHashMap<>();
    ${doFillToJsonArray00(dck, dcv, 3)}
    
    return m;
    `
}


function doFillToJsonArray00(dck, dcv, tipo) {
    const used = {}

    function doDC1__(p) {

        if (tipo === 2) {
            return doDC1ExcelRow(p)
        }
        if (tipo === 3) {
            return doDC1ExcelRowH(p)
        }
        return doDC1(p)
    }


    function doDC1(p) {
        const l_ = []

        l_.push(`
    jsa.add(r.getLong("${p.dcSqlAlias}_id"));
    jsa.add(r.getString("${p.dcSqlAlias}_pkey"));   
    `)

        const dcv1 = model[p.t]
        if (dcv1.pc > -1) {
            const pc1 = dcv1.ps[dcv1.pc]
            l_.push(`        
    jsa.add(r.getString("${p.dcSqlAlias}_${pc1.colName}"));`)
        }
        return l_.join("\n")
    }

    function doDC2__(p2, level) {

        if (tipo === 2) {
            return doDC2ExcelRow(p2)
        }
        if (tipo === 3) {
            return doDC2ExcelRowH(p2, level)
        }
        return doDC2(p2)
    }

    function doDC2(p2) {
        const l_ = []
        const pFld2 = p2.dcSqlAlias;
        l_.push(`
    jsa.add(r.getLong("${pFld2}_id"));
    jsa.add(r.getString("${pFld2}_pkey"));
    `)
        const dcv2 = model[p2.t]
        if (dcv2.pc > -1) {
            const pc2 = dcv2.ps[dcv2.pc]
            l_.push(`
    jsa.add(r.getString("${pFld2}_${pc2.colName}"));
    `)
        }
        return l_.join("\n")
    }

    function doDC1ExcelRow(p) {
        const l_ = []
        const pFld = p.dcSqlAlias;
        l_.push(`
//${p.n}   ${pFld}        
    if(withIds){
        lToCell(r, row,"${pFld}_id", nc++);
    }`)
        l_.push(`
    sToCell(r, row,"${pFld}_pkey", nc++);`)

        const dcv1 = model[p.t]
        if (dcv1.pc > -1) {
            const pc1 = dcv1.ps[dcv1.pc]
            l_.push(`
    sToCell(r, row,"${pFld}_${pc1.colName}", nc++);`)
        }
        return l_.join("")
    }

    function doDC1ExcelRowH(p) {
        const pName = p.n

        const l_ = []
        l_.push(` 
// ${p.n}   ${pName}
    if(withIds){
        m.put("${pName}_id",LONG);                       
    }`)
        l_.push(`
    m.put("${pName}_pkey",STRING);     `)

        const dcv1 = model[p.t]
        if (dcv1.pc > -1) {
            const pc1 = dcv1.ps[dcv1.pc]
            l_.push(`
    m.put("${pName}_${pc1.n}",STRING);  `);

        }
        return l_.join("")
    }


    function doDC2ExcelRow(p2) {
        const l_ = []
        const p2Fld = p2.dcSqlAlias
        l_.push(`
// ${p2.n}  ${p2Fld}
    if(withIds){
       lToCell(r, row,"${p2Fld}_id", nc++);
    }`)
        l_.push(`
    sToCell(r, row,"${p2Fld}_pkey", nc++);`)


        const dcv2 = model[p2.t]
        if (dcv2.pc > -1) {
            const pc2 = dcv2.ps[dcv2.pc]
            l_.push(`
    sToCell(r, row,"${p2Fld}_${pc2.colName}", nc++);`)
        }
        return l_.join("\n")
    }

    function doDC2ExcelRowH(p2, level) {
        const l_ = []
        const p2Name = p2.n;
        l_.push(`
//[${level}] ${p2.n} --   ${p2Name}
    if(withIds){
        m.put("${p2Name}_id",LONG);              
    }      `)
        l_.push(`        
    m.put("${p2Name}_pkey",STRING);  
        `)


        const dcv2 = model[p2.t]
        if (dcv2.pc > -1) {
            const pc2 = dcv2.ps[dcv2.pc]
            l_.push(`
    m.put("${p2Name}_${pc2.n}",STRING);  `)
        }


        return l_.join("")
    }




    function doPs1(p) {
        if (p.t === 'LocalDate' || p.t === 'LocalDateTime') {

            if (p.nullable) {
                return ` 
        asMaybeNullLocalDate(r,"${tb0}_${p.colName}",jsa); //${p.nullable}`

            } else {
                return `
        jsa.add(r.getLocalDate("${tb0}_${p.colName}").toString() ); // ${p.nullable}`

            }
        }
        return `       
        jsa.add(r.get${p.t}("${tb0}_${p.colName}") );`

    }

    //bdToCell
    function doPs1Excel(p) {
        let s = `    //${p.n}     `
        if (p.t === 'LocalDate') {
            s += `       
            ldToCell(r, row,"${tb0}_${p.colName}", nc++); `

        } else if (p.t === 'LocalDateTime') {
            s += `       
            ldtToCell(r, row,"${tb0}_${p.colName}", nc++); `

        } else if (p.t === 'Long') {
            s += `       
            lToCell(r, row,"${tb0}_${p.colName}", nc++); `

        } else if (p.t === 'Integer') {
            s += `       
            iToCell(r, row,"${tb0}_${p.colName}", nc++); `

        } else if (p.t === 'BigDecimal') {
            s += `
            bdToCell(r, row,"${tb0}_${p.colName}", nc++); `
        } else if (p.t === 'Boolean') {
            s += `
                bToCell(r, row,"${tb0}_${p.colName}", nc++); `
        } else {
            s += `  
            sToCell(r, row,"${tb0}_${p.colName}", nc++); `
        }
        return s
    }


    function doPs1ExcelH(p) {


        let s = `    
//${p.n}    
    m.put("${dcv.dcname}_${p.n}",${p.t.toUpperCase()});          `
    return s

    }




    function doPs1__(p) {
        if (tipo === 2) {
            return doPs1Excel(p)
        }
        if (tipo === 3) {
            return doPs1ExcelH(p)
        }
        return doPs1(p)
    }

    const ps = dcv.ps
    const tb0 = dcv.tableName
    const l0 = []
    if (tipo === 1) {
        l0.push(`jsa.add(r.getLong("${tb0}_id") );`)
    } else if (tipo === 3) {
        l0.push(`
    if(withIds){
        m.put("${dcv.dcname}_id",LONG);
    }    `)

    } else {
        l0.push(`
    if(withIds){
        lToCell(r, row,"${tb0}_id", nc++); 
    }        `)

    }

    if (ps !== undefined) {
        ps.filter(p => {
            return p.isPassword !== true
        }).forEach((p) => {
            l0.push(doPs1__(p))
        })
    }

    const parents = dcv.parents
    if (parents !== undefined) {


        if (tipo === 3) {
            l0.push(`
    if(level<1){
        return m;    
    }      `)
        }

        ////MMMMM 11111

        parents.forEach(p => {
            const dcv1 = model[p.t]
            l0.push(doDC1__(p))
            used[p.n] = 1

        })

        ///// ////NNNNN MMMMM 111111


        ////MMMMM 2222

        parents.forEach(p => {
            const dcv1 = model[p.t]

            const parents2 = dcv1.parents
            if (parents2 !== undefined) {
                parents2.forEach(p2 => {

                    if (used[p2.n] === undefined) {
                        const dcv2 = model[p2.t]
                        l0.push(doDC2__(p2, 2))
                        used[p2.n] = 1
                    }

                })
            }
        })

        ///// ////NNNNN MMMMM 222222

        ////MMMMM 33333

        parents.forEach(p => {


            const dcv1 = model[p.t]
            const parents2 = dcv1.parents
            if (parents2 !== undefined) {
                parents2.forEach(p2 => {
                    const dcv2 = model[p2.t]
                    const parents3 = dcv2.parents
                    if (parents3 !== undefined) {
                        parents3.forEach(p3 => {

                            if (used[p3.n] === undefined) {
                            const dcv3 = model[p3.t]
                            l0.push(doDC2__(p3, 3))
                            used[p3.n] = 1

                             }

                        })
                    }

                })
            }
        })

        ///// ////NNNNN MMMMM 333333

    }

    return (l0.join(""))
}
/***** */

exports.doJMapStore = function (dck, dcv) {

    const localDateImport = dcv.withDate ? "import java.time.LocalDate;" : ""

    const localDateTimeImport = dcv.withDateTime ? "import java.time.LocalDateTime;" : ""

    return `

import java.util.Collection;
import java.util.Map;
import java.util.LinkedHashMap;
import org.lonpe.mapstore.AbstractDCMapStore;
import org.lonpe.model.impl.${dck};
import org.lonpe.services.DBLon0;
    
public class ${dck}MapStore extends AbstractDCMapStore<${dck}>{

    
    /**
     * Constant name for domain class
     */
    public static final String DC = "${dcv.dcname}";



    private final DBLon0 dBLon0;
    /**
     *
     * @param dBLon0
     */
    public ${dck}MapStore(DBLon0 dBLon0) {        
        this.dBLon0 = dBLon0;
    }


    /**
     *
     * @param key 
     * @param ${dcv.dcname}
     */

    @Override
    public void store(String key, ${dck} ${dcv.dcname}) {
        dBLon0.store00(DC, ${dcv.dcname});
    }
    
    @Override
    public ${dck} load(String key) {
        return (${dck})dBLon0.load00(DC, key);         
    }

   
    @Override
    public Iterable<String> loadAllKeys() {
        return dBLon0.loadAllKeys00(DC);
    }


    /**
     *
     * @param keys
     * @return
     */

    @Override
    public Map<String, ${dck}> loadAll(Collection<String> keys) {
        final Map<String, ${dck}> m = new LinkedHashMap<>();
        keys.stream().forEach((String t) ->  m.put(t, load(t)));
        return m;
    }

}           
    `
}

exports.doJService = function (dck, dcv) {

    const parents = dcv.parents
    const wImp = (v, vc) => {
        return v ? "import " + vc + ";" : "";
    }


    const withMapZz = () => {
        const l = []
        if (parents) {
            l.push(`
    private static final Map<String, ZtatUnitInfoLon> mz1 = new HashMap<>(6);                       `);

            let hasp2 = false
            let hasp3 = false
            parents.forEach((dcpn) => {
                const dcv2 = model[dcpn.t]
                if (dcv2.parents) {
                    hasp2 = true
                    dcv2.parents.forEach((dcpn2) => {
                        const dcv3 = model[dcpn2.t]
                        if (dcv3.parents) {
                            hasp3 = true
                        }
                    })


                }


            })
            if (hasp2) {
                l.push(`
    private static final Map<String, ZtatUnitInfoLon2> mz2 = new HashMap<>(6);                       `);
            }
            if (hasp3) {
                l.push(`
    private static final Map<String, ZtatUnitInfoLon3> mz3 = new HashMap<>(6);                       `);
            }



        }


        return l.join("")

    }

    const zzz = doVer2aZtatZInfosObjects(dck, dcv)

    const localDateImport = wImp(dcv.withDate, "java.time.LocalDate");
    const localDateTimeImport = wImp(dcv.withDateTime, "java.time.LocalDateTime");
    const bigDecimalImport = wImp(dcv.withBigDecimal, "java.math.BigDecimal");
    const ztatUnitInfoImport = wImp((dcv.parents && dcv.parents.length > 0), "org.lonpe.lonvx.sqlbuilders.ZtatUnitInfoLon");

    const ztatUnitInfoImport2 = wImp((dcv.parents && dcv.parents.length > 0), "org.lonpe.lonvx.sqlbuilders.ZtatUnitInfoLon2");
    const ztatUnitInfoImport3 = wImp((dcv.parents && dcv.parents.length > 0), "org.lonpe.lonvx.sqlbuilders.ZtatUnitInfoLon3");



    return `
import io.vertx.core.MultiMap;
import java.util.Map;
import io.vertx.core.json.JsonObject;
import io.vertx.sqlclient.Tuple;
import io.vertx.core.json.JsonArray;
import org.lonpe.model.*;
import org.lonpe.model.impl.*;
import io.vertx.sqlclient.Row;
import java.util.LinkedHashSet;
import java.util.HashMap;
import java.util.LinkedHashMap;
import org.lonpe.lonvx.sqlbuilders.SqlZtatBuilder;
import org.lonpe.services.AbstractServiceLon;
import org.lonpe.services.ConditionInfo;
import org.lonpe.lonvx.sqlbuilders.SqlLonConditionsBuilder;
import org.apache.poi.xssf.usermodel.XSSFRow;
import static org.lonpe.lonvx.ctes.CteLon.*;
${localDateImport}
${localDateTimeImport}
${bigDecimalImport}
${ztatUnitInfoImport}
${ztatUnitInfoImport2}
${ztatUnitInfoImport3}

/**
 *   ${dck}Service 
 * 
 */
  
public class ${dck}Service extends AbstractServiceLon<${dck}>{

    private static final String SQLINSERT ="${doInsertSql(dck, dcv)}";
    private static final String SQLUPDATE = "${doUpdateSql(dck, dcv, 'id')}";
    private static final String SQLUPDATEPKEY = "${doUpdateSql(dck, dcv, 'pkey')}";
    private static final String SQLVIEW = "SELECT * FROM ${dcv.tableName}_view";
    private static final String SQLCOUNT = "SELECT count(*) FROM ${dcv.tableName}_view";
    private static final String SQLKEYS = "SELECT ${dcv.tableName}_pkey FROM ${dcv.tableName}_view";
    private static final String SQLIDBYPKEY = "SELECT id from ${dcv.tableName} WHERE pkey = $1";
    private static final String SQLLKEYIN = "SELECT id,pkey from ${dcv.tableName} WHERE pkey in ($1)"; 
    private static final String SQLDELETE = "DELETE FROM ${dcv.tableName} WHERE id = $1 returning id";
    private static final String TABLENAME ="${dcv.tableName}";
    ${zzz.defs.join("\n")}

    public ${dck}Service() {
        init0();
    }

    ${withMapZz()}

    @Override
    public String getTableName(){
        return TABLENAME;
    }

    @Override
    public String getSqlDelete(){
        return SQLDELETE;
    }

    @Override
    public String getSqlKeyIn() {
        return SQLLKEYIN;
    }

/**    
    private static String sql00 = "${c.doSqlList00(dck, dcv)}"
*/

    @Override
    public String getSqlKeys(){
        return SQLKEYS;
    }

    @Override
    public String getSqlCount(){
        return SQLCOUNT;
    }
    @Override
    public String getSqlIdByPkey() {
        return SQLIDBYPKEY;
    }

    /**
     * sql select property alias field names
     */
    private final LinkedHashSet<String> names =  new LinkedHashSet<>();;
    
    /**
     * Map field insert/update to property 
     */
    private final HashMap<String,String> insertMapFields = new HashMap<>(); 
    
    /**
    * Map property to field order 
    */
    private final HashMap<String, String> sortMapFields = new  HashMap<>();

    private final JsonObject dcModel  = new JsonObject();
    
    private void init0(){
        ${doNames(dck, dcv)}
        ${doModelChilds(dck, dcv)}
        ${zzz.builds.join("\n")}
    }        
    @Override
    public LinkedHashSet<String> getNames() {
        return names;        
    }

    @Override
    public  HashMap<String, String> getInsertMapFields(){
        return insertMapFields;
    }

    @Override
    public HashMap<String, String> getSortMapFields(){
        return sortMapFields;
    }

    @Override
    public JsonObject elModelo(){
        return  dcModel;
    }

    @Override
    public JsonArray toJsonArray(final Row r){
        final JsonArray jsa = new JsonArray();
        ${doFillToJsonArray(dck, dcv)}
        return jsa;
    }

    @Override
    public int fillXRow(final Row r, final XSSFRow row, int nc,boolean withIds) {
        return fillXRow0(r, row, nc, withIds);
    }

    @Override
    public HashMap<String,String> lXRowH(final boolean withIds, final int level) {        
        ${doFillExcelRowH(dck, dcv)}
    }
    
    private int fillXRow0(final Row r, final XSSFRow row,int nc, final boolean withIds){
        ${doFillExcelRow(dck, dcv)}
        return nc;
    }

    @Override
    public String getSqlView() {
        return SQLVIEW;
    }

    @Override
    public String getSqlByKey() {
        return SQLVIEW+ " WHERE ${dcv.tableName}_pkey =$1";
    }

    @Override
    public String getSqlInsert() {
        return SQLINSERT;
    }

    @Override
    public void fillTupleInsert(final ${dck} dc0, final Tuple t){
        ${doFillTupleDC(dck, dcv)}
    }

    @Override
    public void fillTupleUpdate(final ${dck} dc0, final Tuple t){
        ${doFillTupleUpdateDC(dck, dcv)}        
    }    

    @Override
    public void fillTupleInsert(final Map<String, Object> obj, final Tuple t) {
        ${doFillTupleMapObj(dck, dcv)}
    }    

    @Override
    public void populateParentsIds(final Map<String, Object> obj,final Map<String,Map<String, Long>> mapParents){
        ${fillObjectWithParentsIds(dck, dcv)}
    }

    @Override
    public void fillTupleInsert(final JsonObject js,final Tuple t){       
        ${doFillTuple(dck, dcv)}       
    }

    @Override
    public void fillTupleUpdate(JsonObject js, Tuple t) {
        ${doFillTupleUpdate(dck, dcv)}
    }

    @Override
    public String getSqlIUpdate() {
        return SQLUPDATE;
    }
    @Override
    public String getSqlIUpdatePkey() {
        return SQLUPDATEPKEY;
    }

    @Override
    public ${dck} doFrom(final Row r){
        final ${dck} ${dcv.dcname} = new ${dck}();
        ${fillObjectFromRow(dck, dcv)}  
        return ${dcv.dcname};
    }
    
    @Override
    public ${dck} doFromJson(final JsonObject js){
        ${dck} ${dcv.dcname} = new ${dck}();
        ${dcv.dcname}.setId(js.getLong("id"));
        
        ${fillObjectFromJson(dck, dcv)}
        return ${dcv.dcname};
    }

    @Override
    public JsonObject toJson(final ${dck} o) {        
        final JsonObject jso = new JsonObject();
        ${doFillToJsonObject(dck, dcv)}
        return jso;
    }

    @Override
    public ConditionInfo doCondiciones(final MultiMap params, final Tuple tuple){

        final SqlLonConditionsBuilder slcb = new SqlLonConditionsBuilder(params,tuple);

       //Check Id      
       slcb.doInLongCondition("id", "${dcv.tableName}_id");
        ${doSqlConditionsPs(dck, dcv)}
        ${doVer2a(dck, dcv)}

        slcb.doSQLORDEN(sortMapFields);

        return slcb.getConditionInfo();

    }


   
    @Override
    public SqlZtatBuilder doZtat(final MultiMap params) {
        final SqlZtatBuilder sz0 = new SqlZtatBuilder(params,"${dcv.tableName}");
        sz0.applyFieldName("COUNT(${dcv.tableName}.id) as c_${dcv.tableName}_id","count");
        ${doSumNumsZtat(dck, dcv)}
        ${doVer2aZtat(dck, dcv)}
        return sz0;
    }
}
    `
}

exports.doJMapServices = function (dck, dcv) {
    const nn = dck.substring(0, 1).toLowerCase() + dck.substring(1)
    return `
        m.put("${nn}", new ${dck}Service()); `
}
