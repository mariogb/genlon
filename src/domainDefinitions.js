const fs = require('fs')
const fns = require('./functions1.js')
const fnsVue = require('./functionsVue.js')

const model = require('./modelo.js').model


const c = require('./CommonLon')

//import from fs


//const fns = require('./functions1.js').default
//import {doJclzz} from './functions1' 
//import {writeFile} from 'fs'

const toUp = (s) => {
    return s.substring(0, 1).toUpperCase() + s.substring(1)
}
const toDown = (s) => {
    return s.substring(0, 1).toLowerCase() + s.substring(1)
}

function camelize(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
}

function camelToUnderscore(s) {
    var result = s.replace(/([A-Z])/g, " $1");
    return result.split(' ').join('_').toLowerCase();
}


function doDcName(dck) {

    return dck.substring(0, 1).toLowerCase() + dck.substring(1)
}

function doDcTableName(dck) {
    return camelToUnderscore(doDcName(dck))
}


function doDcColName(pn) {
    return camelToUnderscore(doDcName(pn))
}

function doDcColNameParent(p) {
    return doDcColNameAsSql(p) + "_id" // camelToUnderscore(pn) + "_id"
}

function doDcColNameAsSql(p) {

    return doDcTableName(p.n)
}

function doDcNameParentSql(pn) {
    return camelToUnderscore(pn)
}

const doColType = (p) => {

    if (p.t === "LocalDate") {        
        return 'Date';
    } 
    if (p.t === "LocalDateTime") {
        return 'timestamp';
    
    } 
    if (p.t === "BigDecimal") {
        return  'numeric(16,6)';
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

//extend model
for (const dck in model) {
    let dcv = model[dck]
    dcv.dcname = doDcName(dck)

    if (dcv.tableName === undefined) {
        dcv.tableName = doDcTableName(dck)
    }

    dcv.pDw = toDown(dck)
    let ps = dcv.ps

    if (ps === undefined) {
        ps = []
    }
    if (ps.findIndex(p => { return p.n === 'pkey' }) < 0) {
        ps.push({
            n: 'pkey',
            t: 'String',
            size: 32,
            unique: true
        })
    }


    ps = ps.sort((a, b) => {
        if (a.n === "pkey") {
            return -1;
        }
        if (b.n === "pkey") {
            return 1;
        }

        return a.n > b.n ? 1 : -1

    })


    let pcIdx = ps.findIndex(p => {
        return p.n === "pname" || p.n === "title" || p.n === "label"
    })
    
    if (pcIdx > -1) {
        dcv.pc = pcIdx
        dcv.pcn = ps[pcIdx].n
    }

    ps.forEach(p => {
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
for (const dck in model) {
    let dcv = model[dck]
    const parents = dcv.parents
    if (parents !== undefined) {
        parents.forEach(p => {

            console.log("ON PARENT  dcv",dcv.dcname)
            console.log("P",p)


            p.colName = doDcColNameParent(p)
            p.dcSqlAlias = doDcColNameAsSql(p)
            p.colType = 'bigint'
            p.nUp = toUp(p.n)
            p.dcTable = model[p.t].tableName //    doDcTableName(p.t)//doDcNameParentSql(p.n)
            p.tDw = toDown(p.t)

        })
    }
    const childs = dcv.childs
    if (childs !== undefined) {
        childs.forEach(p => {
            p.nUp = toUp(p.n)
            console.log("ON CHILD  dcv",dcv.dcname)
            console.log("P",p)
            p.dcTable = model[p.t].tableName //    doDcTableName(p.t)//doDcNameParentSql(p.n)
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
//


function doCreateTableIdSequence(dck, dcv) {
    return c.doCreateTableIdSequence(dck,dcv)
}

function doCreateTable(dck, dcv) {
    return c.doCreateTable(dck,dcv)
}

function doSqlView(dck, dcv) {
    const tb0 = dcv.tableName
    return `
-- VIEW FOR   ${dck}
Select '\nCreate view for ${dck}' as dc;
CREATE OR REPLACE VIEW ${tb0}_view as \n${doSqlList(dck, dcv)};\n`
}


function createUniqueParentSqlIndex(dck, dcv) {
    return fns.createUniqueParentSqlIndex(dck, dcv)
}

//CREATE UNIQUE INDEX account_pkey ON public.account USING btree (id)
//CREATE UNIQUE INDEX account_pkey_idx ON public.account USING btree (pkey)
function doSqlList(dck, dcv) {
    return c.doSqlList00(dck, dcv)
}

function doFK(dck, dcv) {
    const parents = dcv.parents
    if (parents === undefined) {
        return ""
    }
    const l0 = [`
-- Foreign keys for  ${dck}  ${dcv.tableName}   
    
    `]
    parents.forEach(p => {
        const dcv1 = model[p.t]
        const tb1 = dcv1.tableName

        const fk00 = `
--   To: ${dcv1.dcname} ${p.colName}

ALTER TABLE "public"."${dcv.tableName}"
ADD CONSTRAINT fk_${dcv.tableName}_xx_${p.colName}
FOREIGN KEY (${p.colName})
REFERENCES "public"."${tb1}"(id);   `

        l0.push(fk00)

        // const isNull = (p.nullable === undefined || !p.nullable) ? ' NOT NULL' : ''
    });

    const rr = createUniqueParentSqlIndex(dck, dcv)
    if (rr.length > 0) {
        l0.push(rr.join("\n"))
    }
    return l0.join("\n");
}



function toFile(f, data) {
    fs.writeFile(f, data, (err) => {
        if (err) {
            console.log(err)
            throw err
        }
    })
}



const log = (c) => {
    console.log(c)
}
/*
function doOnModel2(fn) {
    for (const dck in model) {
        let dcv = model[dck]
        const fout = `/home/l5/js_templates/unolon/${dck}.java`

        toFile(fout, fn(dck, dcv))
    }
}
*/
/*
function doOnModel(fn) {
    for (const dck in model) {
        let dcv = model[dck]
        log(fn(dck, dcv))
    }
}
*/


function doOnModel2(fn) {
    const l0 = []
    for (const dck in model) {
        let dcv = model[dck]
        l0.push(fn(dck, dcv))
    }

    return l0.join("\n")

}


function doJavaDcClasses(fo) {
    for (const dck in model) {
        const dcv = model[dck]
        const fout = `${fo}/${dck}.java`
        const code = `
package org.lonpe.model.impl;            

            ${fns.doJclzz(dck, dcv)}
        `
        toFile(fout, code)
    }
}

function doJavaDcServiceClasses(fo) {
    for (const dck in model) {
        const dcv = model[dck]
        const fout = `${fo}/${dck}Service.java`
        const code = `
package org.lonpe.services.impl;            

            ${fns.doJService(dck, dcv)}
        `
        toFile(fout, code)
    }
}


function doMapStore(fo) {

    for (const dck in model) {
        const dcv = model[dck]
        const fout = `${fo}/${dck}MapStore.java`
        const code = `
package org.lonpe.mapstore.impl;            

            ${fns.doJMapStore(dck, dcv)}
        `
        toFile(fout, code)
    }

}


function doDCMapServices(fo) {

    const fout = `${fo}/DcMapForServices.java`

    const l0 = []

    function doInit() {
        Object.keys(model).sort().forEach(dck => {
            const dcv = model[dck]
            l0.push(`        m.put("${dcv.dcname}", new ${dck}Service());`)
        })
        return l0.join("\n")
    }

    function code() {
        return `
package org.lonpe.services.impl;
    
import io.vertx.core.json.JsonObject;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import org.lonpe.services.AbstractServiceLon;
    
    public class DcMapForServices {
    
        final Map<String, AbstractServiceLon> m;
    
        public DcMapForServices() {
            this.m = new HashMap<>();
            
            ${doInit()}
            
        }
    
        public JsonObject model() {
    
            final JsonObject jsm = new JsonObject();
            m.forEach((String t, AbstractServiceLon u) -> {
               jsm.put(t, u.elModelo());
            });
                    
            return new JsonObject().put("m_dcmodel",jsm);
    
        }
    
        public AbstractServiceLon getServiceFor(final String dc) {
            return m.get(dc);
        }
    
        public JsonObject modelFiltered(List<String> l_exclude) {
            final JsonObject jsm = new JsonObject();
            m.forEach((String t, AbstractServiceLon u) -> {
                if(!l_exclude.contains(t)){
                    jsm.put(t, u.elModelo());
                }
            }); 
            return  jsm;                  
        }
    }        
        `

    }

    toFile(fout, code())


} //end doDCMapServices



function doJavascriptMsgs(fo) {

    function doMsg0(dck, dcv) {

        function doParents() {
            const parents = dcv.parents
            if (!parents) {
                return ""
            }
            return parents.map((dcp) => {
                const label = dcp.l ? dcp.l : dcp.n;
                return `${dcp.n}:"${label}"`

            }).join("\n,");
        }

        function doPS() {
            if (!dcv.ps) {
                return "";
            }
            const ps = dcv.ps
            return ps.map((p) => {
                const label = p.l ? p.l : p.n;
                return `${p.n}:"${label}"`
            }).join("\n,");
        }

        const dcMsg = dcv.dcMsg ? dcv.dcMsg : dcv.dcname
        const lDcMsg = dcv.lDcMsg ? dcv.lDcMsg : dcv.dcname + "s"
        const allProps = []
        allProps.push(`dcMsg:"${dcMsg}"`)
        allProps.push(` lDcMsg:"${lDcMsg}"`)
        allProps.push(doPS())
        allProps.push(doParents())
        return `
    ${dcv.dcname}:{
     ${allProps.join("\n,")}         
    }  `

    }

    const fout = `${fo}/MsgFactory.ts`
    const l = []
    for (const dck in model) {
        const dcv = model[dck]
        l.push(doMsg0(dck, dcv))
    }

    const code = `
    const messages = {
        ${l.join(",")}
    }
    export default function () {
        const msgUIs = (k: string) => {
            const v: string = messages[k]
            if (!v) {
                return k;
            }
            return v;
        }
        return {
            msgUIs
        }
    }
    `

    toFile(fout, code)

}

function sqlFile0(fo) {
    const l0 = []

    const fout = `${fo}/initSql.sql`
    l0.push(`

-- SEQUENCES ----------------------------------------

${doOnModel2(doCreateTableIdSequence)}

-- TABLES ------------------------------------------

${doOnModel2(doCreateTable)}

-- Foreign Keys -------------------------------------

${doOnModel2(doFK)}

-- VIEWS --------------------------------------------

${doOnModel2(doSqlView)}

`)
    //password = 1234
    const encPass = '$2a$10$HBZSukSb/GalARyzAV5p7u2gn/FBTEnrxROhaLdTMDNCA1kDHaJfe';
    const SQLINSERT_UADM = "INSERT INTO user_lon(pname,username,password,email,type_lon,pkey) VALUES ('admin','admin','" + encPass + "','adm@gg.com','ADM','admin') returning id;";
    l0.push(`
    -----
    -- Add user admin to db
    ${SQLINSERT_UADM}

    ----
    -- Add many users type SUBADM db
    `)
    for (var i = 0; i < 5; i++) {
        l0.push('-- ' + (i + 1))
        let ssadm = `INSERT INTO user_lon(pname,username,password,email,type_lon,pkey) VALUES ('subadmin${i}','sadmin${i}','${encPass}','sadm${i}@gg.com','SUBADM','sad${i}') returning id;`;
        l0.push(ssadm)
        for (var j = 0; j < 5; j++) {

            let sagent = `INSERT INTO user_lon(pname,username,password,email,type_lon,pkey) VALUES ('agent_${i}x${j}','agent_${i}x${j}','${encPass}','agent_${i}x${j}@gg${i}.com','AGENT','agent_${i}x${j}') returning id;`;
            l0.push(sagent)
            let t3 = `INSERT INTO user_lon(pname,username,password,email,type_lon,pkey) VALUES ('third_${i}x${j}','third_${i}x${j}','${encPass}','third_${i}x${j}@t${j}${5 * i - 2 * j}h${i}.com','THIRD','third_${i}x${j}') returning id;`;
            l0.push(t3)
        }
    }

    const l_ws = ["Edificio 1"]

    const sqlWorkSpaceGroup = "INSERT INTO work_space_group(pkey,pname,type_lon,base_id) VALUES ($1,$2,$3,$4) returning id,pkey";
    const l_base = ['Matriz', 'Sucursal Nte', 'Sucursal Sur', 'Almacenes']
    const l_departament = ['Contabilidad', 'Ventas', 'Compras', 'Operacion', 'Sistemas']
    l_departament.forEach((d, idx) => {
        const d2 = d.replace(' ', '')
            .toLowerCase()
            .replace(/[aeiou]/g, '')
            .toUpperCase()
        l0.push(`
 INSERT INTO departament(pkey,description,fast_key,pname) 
 VALUES 
 ('${d2}','Sin Descripción para ${d}',${idx},'${d}') returning id;
        `)
    })


    l_base.forEach((b, idx) => {
        const b2 = b.split(' ').map(e => {
            return e.replace(/[aeiou]/g, '').substr(0, 3)
        })
            .join("")
            .toUpperCase()
        l0.push(`
    INSERT INTO base(pkey,pname) VALUES ('${b2}','${b}') returning id;
`)

    })

    l0.push(`
CREATE TABLE atomiclon(pkey varchar(64) unique, val int8);


INSERT INTO atomiclon(pkey,val) VALUES ('sale_folio',1);
INSERT INTO atomiclon(pkey,val) VALUES ('purchase_folio',1);

INSERT INTO atomiclon(pkey,val) VALUES ('invoice_line_in_pkey',1);


-- Example to moveBetween racks
-- Double  booking
----     UPDATE stock_rack_product SET quantity = quantity - NEW.quantity WHERE item_id = NEW.item_id AND rack_id = NEW.from_rack_id;
--     UPDATE stock_rack_product SET quantity = quantity + NEW.quantity WHERE item_id = NEW.item_id AND rack_id = NEW.to_rack_id;



-- CREATE OR REPLACE FUNCTION update_stock_rack_product_quantity_on_invoice_in()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     UPDATE stock_rack_product SET quantity = quantity + NEW.ask_quantity WHERE id = NEW.stock_rack_product_id AND product_id = NEW.product_id;
--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;
-- 
-- 
-- 
-- CREATE TRIGGER update_stock_rack_product_quantity_on_invoice_in
-- AFTER INSERT ON invoice_line_in
-- FOR EACH ROW
-- EXECUTE PROCEDURE update_stock_rack_product_quantity_on_invoice_in();


-- CREATE OR REPLACE FUNCTION update_stock_rack_product_quantity_on_invoice_out()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     UPDATE stock_rack_product SET quantity = quantity - NEW.quantity WHERE item_id = NEW.item_id AND rack_id = NEW.to_rack_id;
--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;
-- 
-- 
-- 
-- CREATE TRIGGER update_stock_rack_product_quantity_on_invoice_out
-- AFTER INSERT ON invoice_line_in
-- FOR EACH ROW
-- EXECUTE FUNCTION update_stock_rack_product_quantity_on_invoice_out();








`)

    let code = l0.join("\n")

    toFile(fout, code)
}

/*
public Map hazRutasA(String dcFix00){
        def lRuta1 = [:] 
        mapDcs.each{dc1_entry ->
            def dc1n = dc1_entry.key.decapitalizedName
            if(dc1n==dcFix00){
                lRuta1[dc1n] = []
            }else{
                dc1_entry.value.each{ dc2_entry ->
                    def dc2n = dc2_entry.key.decapitalizedName
                    if(dc2n==dcFix00){
                        lRuta1[dc1n] = [dc2n]
                    }else{
                        dc2_entry.value.each{ dc3_entry ->
                            def dc3n = dc3_entry.key.decapitalizedName                         
                            if(dc3n==dcFix00){
                                lRuta1[dc1n] = [dc2n,dc3n]
                            }              
                        }              
                    }              
                  
                }                    
              
            }
          
        }
        return lRuta1
    }
*/
function hazRutasA(dcFix00, dck, dcv) {
    const lRuta1 = {
        1: [],
        2: [],
        3: [],
        4: []
    }
    const parents = dcv.parents
    if (parents === undefined) {
        return lRuta1
    }
    parents.forEach(p => {

        const dcv1 = model[p.t]

        if (p.n == dcFix00) {
            lRuta1[1].push(p)
        } else {

            const parents2 = dcv1.parents

            if (parents2) {
                parents2.forEach(p2 => {
                    if (p2.n == dcFix00) {
                        lRuta1[2].push([p, p2])
                    } else {

                        const dcv2 = model[p2.t]
                        const parents3 = dcv2.parents
                        if (parents3) {
                            parents3.forEach(p3 => {
                                if (p3.n == dcFix00) {
                                    lRuta1[3].push([p, p2, p3])
                                }
                            })
                        }
                    }
                })
            }


        }

    })
    return lRuta1

}


function doRuta_DBTP(lRuta1) {
    const l = []

    for (let i1 = 0; i1 < lRuta1[1].length; i1++) {
        const rr = lRuta1[1][i1]

        const s = ` 
      //1  
    public Single<List<Map<String, Object>>> doCheck${rr.nUp}(Long uid,final String typelon,Long ${rr.dcSqlAlias}_id){
       String sviewQl = "select rest_dpbtp.dbtp_id from  rest_dpbtp where  rest_dpbtp.dbtp_id=\$1";
       if(!typelon.equals("ADM")){
            sviewQl+=  " and rest_dpbtp.ul_id = \$2";
       } 
      return crudLon.doListM(sviewQl,doTuple00(typelon,uid,${rr.dcSqlAlias}_id));
    }     
    `
        l.push(s)
    }

    for (let i1 = 0; i1 < lRuta1[2].length; i1++) {
        const rr = lRuta1[2][i1]

        if (rr.length > 0) {
            const v001 = rr[0]
            const v002 = rr[1]
            const dc1 = model[v001.t]
            const dc2 = model[v002.t]
            const s = ` 
          //2 
          public Single<List<Map<String, Object>>> doCheck${v001.nUp}(Long uid,final String typelon,Long ${v001.dcSqlAlias}_id){
            final String sviewQl = doPreSql(typelon);
            final String sql00 = "select ${dc1.tableName}.id from ${dc1.tableName} where ${dc1.tableName}.${dc2.tableName}_id in ("+sviewQl+") and ${v001.dcSqlAlias}.id = \$1 ";
            return crudLon.doListM(sql00,doTuple00(typelon,uid,${v001.n}_id));
           }      
        `
            l.push(s)
        }

    }



    return l.join("\n")

}


const prjRoot =  "/home/l5/vx"

const srcJavaOut = `${prjRoot}/src/main/java`
const foutDcClzz = `${srcJavaOut}/org/lonpe/model/impl`; ///home/l5/js_templates/unolon"
const foutDcServiceClzz = `${srcJavaOut}/org/lonpe/services/impl`; ///home/l5/js_templates/unolon"

const foutDcMapStoreClzz = `${srcJavaOut}/org/lonpe/mapstore/impl`;
const foutDCMapService = `${srcJavaOut}/org/lonpe/services/impl`;


const argv = process.argv

let tarea = "default"


console.log(argv)
if (argv.length > 2) {
    tarea = argv[2]
}


//doDCMapServices(foutDCMapService)





//console.log("AAAA")
//if(tarea==="defaultAll"){
log("HACIENDO SQL FILE")    
sqlFile0(prjRoot)
log("HACIENDO ENTIDADES JAVA")    
doJavaDcClasses(foutDcClzz)

log("HACIENDO SERVICIO JAVA")    
doJavaDcServiceClasses(foutDcServiceClzz)
doMapStore(foutDcMapStoreClzz)
doDCMapServices(foutDCMapService)

const path_000 = prjRoot + "/front/fpub1/src/"
doJavascriptMsgs(path_000 + "/liblon/");

//}

//if(tarea==="vues_1" || tarea!==""){
const path_001 = prjRoot + "/front/fpub1/src/floncomponents";
fnsVue.doVues1(path_001, "Purchase");
fnsVue.doVuesDetail(path_001, "Purchase");

fnsVue.doVues1(path_001, "Sale");
fnsVue.doVuesDetail(path_001, "Sale");

//fnsVue.doVues1(path_001, "Airport");
//fnsVue.doVuesDetail(path_001, "Airport");

fnsVue.doVues1(path_001, "DepartamentBaseTimePeriod");
fnsVue.doVuesDetail(path_001, "DepartamentBaseTimePeriod");



//}

if (tarea === "help") {
    console.log(" use: node domainDefinitions.js [vues_1,default]")
}



//--------------


//foutDcMapStoreClzz
//doOnModel(doInsertSql)

//log(fns.doJclzz)

//doOnModel2(fns.doJclzz)


//toFile('/home/l5/js_templates/unolon/a.txt','aaaaa')

/*

for (const dck in model) {
    let dcv = model[dck]
    log("--DC "+dck)
    log(doCreateTable(dck, dcv) )
}*/
