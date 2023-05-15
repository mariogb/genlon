const fs = require('fs')

const doSimpleMap = require('./FunLones.js').doSimpleMap

function toFile(f, data) {
  fs.writeFile(f, data, (err) => {
    if (err) {
      console.log(err)
      throw err
    }
  })
}

const model = require('./modelo.js').model
const css1 = require('./css2Specific.js').getCss
const css2 = require('./css2Specific.js').getCssDetail



const mapaTipos = {
  'String': 'String',
  'LocalDateTime': 'Date'
}

const mapaTiposForm = {
  'String': 'text',
  'LocalDateTime': 'datetime-local',
  'BigDecimal': 'number',
  'Integer': 'number',
  'Long': 'number'
}


//Function to write pug alike 
const _wp = (t, nt) => {
  const l2 = [];
  const l = t.split('\n');
  const n = l.length;
  for (let i = 0; i < n; i++) {
    l2.push(' '.repeat(nt + i * 2) + l[i].trim());
  }
  return l2.join('\n');
};



function doTSTipo(v) {
  const v2 = mapaTipos[v]
  if (v2) {
    return v2
  }
  return v;
}

function doTSTipoForm(v) {
  const v2 = mapaTiposForm[v]
  if (v2) {
    return v2
  }
  return v;
}

const dcMsg = (dcv) => {
  return dcv.dcMsg ? dcv.dcMsg : dcv.dcname
}


const lDcMsg = (dcv) => {
  return dcv.lDcMsg ? dcv.lDcMsg : dcv.dcname + "s"

}


function doTmplAc(p, elem0) {
  if (p.tmplOnAcParent) {
    return p.tmplOnAcParent.map((e) => {
      return ` {{${elem0}['${e}']}}`
    }).join(" ")
  }
  return `{{${elem0}}}`
}






exports.doVues1 = function (fo, dck) {

  const dcv = model[dck]

  if (!dcv) {
    console.log("\n\t no object " + dck + " in model!!!!\n")
    return
  }
  const fout = `${fo}/FVlon${dck}.vue`

  /** HTML VUE TEMPLATE for select parent*/
  function doParentSelectInForm(p, ii) {

    const dcv1 = model[p.t]

    const l00 = []
    const ps1 = dcv1.ps
    if (ps1) {
      ps1.filter((pp) => {
        return pp.setBySys === undefined
      }).forEach((p100) => {
        l00.push(`
          .f.${p100.n} {{ e0.${p100.n} }}`)
      })
    }


    const simpleMap1 = doSimpleMap(p.t, dcv1)

    function onSimpleMapLevel(level) {
      const sm1 = simpleMap1[level]
      if (sm1) {
        sm1.forEach((p1) => {
          const dcv1 = model[p1.t]
          l00.push(`
          .f.${p1.n}_pkey {{ e0.${p1.n}_pkey }}    `)
          if (dcv1.pcn) {
            l00.push(`
          .f.${p1.n}_${dcv1.pcn} {{ e0.${p1.n}_${dcv1.pcn} }}    `)
          }
        })
      }
    }

    onSimpleMapLevel('1')
    onSimpleMapLevel('2')
    onSimpleMapLevel('3')


    //Add special show and search

    function losAutocompletes() {

      function doInputAC(n) {
        return `
        .ff
          label(for="${n}") ${n}
          input(type="text", v-model="item_ac_${p.n}['${n}']" ,autocomplete="off",placeholder="buscar",name="${n}",@input="updateAC_${p.n}('${n}')",v-on:keyup.enter="select01()")
`
      }

      const l22 = []
      l22.push(doInputAC('pkey'));

      if (dcv1.pcn) {
        l22.push(doInputAC(dcv1.pcn));
      }

      if (ps1) {
        ps1.filter((p) => {
          return p.setBySys === undefined && p.withIndex
        }).forEach((p100) => {
          l22.push(doInputAC(p100.n));

        });
      }
      return l22.join("")
    }


    return `
    .dc_p.col-${ii}
      h3 ${p.n}s
      div.resac
        .resacf1(v-if="ldco00_${p.n} && ldco00_${p.n}.l")
          div.resac-e(v-for="(e0, i0) in ldco00_${p.n}.l",:key="e0.id"  v-on:click="put_${p.n}(e0,1)")
            span.pkey {{e0.pkey}}
            div ${doTmplAc(p, "e0")}

        ${losAutocompletes()}
      
      .cont-dcp(v-if="m_dc_${p.n} && m_dc_${p.n}.l")
        .l-loop(v-for="e0 in m_dc_${p.n}.l", :key="'${p.n}_' + e0.id") 
          ${l00.join("")}
          .f 
            button(v-on:click="put_${p.n}(e0)") SET
        `
  }
  /** */

  /** HTML VUE TEMPLATE for selected parent value*/
  function doParentFor_Selected_InForm(p, ii) {
    const dcv1 = model[p.t]
    const l00 = []
    const ps1 = dcv1.ps
    if (ps1) {
      ps1.forEach((p100) => {
        l00.push(`
              .it-${p100.n} 
                label ${p100.n} 
                span.pval {{ item_${p.n}.${p100.n} }}`)
      })
    }


    const parents2 = dcv1.parents
    if (parents2) {
      parents2.forEach((p_dc2) => {

        l00.push(`
              .it-${p_dc2.n}
                label  ${p_dc2.n}
                span.pkey {{ item_${p.n}.${p_dc2.n}_pkey }}
                span.pc {{ item_${p.n}.${p_dc2.n}_pname }}    `)

      })
    }

    return `
          .dcp.pp-${ii}
            h4 ${p.n}
            .item_dc-p(v-if="item_${p.n} && item_${p.n}.id")
            ${l00.join("")}     
              button(v-on:click="removeDC_${p.n}()") X `

  }

  /** JS ITEM INITIAL DEFINITION FOR ROOT DOMAIN CLASS  */
  
  function doItem00() {
  const l0 = ["pkey:\"\""];
  const ps = dcv.ps;

  if (ps) {
    ps.filter(p => p.n !== 'pkey' && p.setBySys === undefined).forEach(p => {
      let defaultValue = "";

      switch (p.t) {
        case "Date":
        case "LocalDate":
        case "LocalDateTime":
          defaultValue = "new Date()";
          break;
        case "Integer":
          defaultValue = "0";
          break;
        default:
          defaultValue = "\"\"";
          break;
      }

      l0.push(`${p.n}: ${defaultValue}`);
    });
  }

  return l0.join(",\n");
}

  

  /** JS PARENT DOMAIN CLASS FUNCTIONS AND ITEMS */
  function doParentFor_JSCode(p, ii) {
    const dcv1 = model[p.t]
    // const l00 = []
    //const ps1 = dcv1.ps

    /***
     * 
     todo : add in callback list if is invoiceLines
     
              if(res.l){
                res.l.forEach((e)=>{extendElement(e)})
                calcSums_invoiceLines(res)
              }          
              
     * 
     */


    return `
/** DC parent ${p.n}   */

      const m_dc_${p.n} = ref({});
      const item_${p.n} = ref({});
      const item_ac_${p.n} = ref({});
      const ldco00_${p.n} = ref({});
      const idxSelect_${p.n} = ref(-1);

      const put_${p.n} = (e,o) =>{
        item_${p.n}.value=  e;
        //item_${dcv.dcname}.value['${p.n}_id']=e.ids
        //item_${dcv.dcname}.value['${p.n}_pkey']=e.pkey

        if(o){
          ldco00_${p.n}.value={l:[]}
        }

      }
  
      const loadList_${p.n} = () => {
        const payload = { dc: "${dcv1.dcname}" };
        doList(payload).then((res) => {

      

          m_dc_${p.n}.value = res;
        });
      }; 

      const updateAC_${p.n} =(k:string)=>{
        console.log("222",k)
           const v = item_ac_${p.n}.value;
           const pv  =  v[k] //,dcp
           update(k,pv,"${dcv1.dcname}",ldco00_${p.n})
      } 

      const removeDC_${p.n} = (k:string)=>{
        item_${p.n}.value={};
      }
      

     `
  }

  function doParentFor_JSCodeInit(p, ii) {
    const dcv1 = model[p.t]
    const l00 = []
    const ps1 = dcv1.ps
    if (p.onForm && p.onForm === "getAll") {
      return `
    loadList_${p.n}();    `
    } else {
      return `
      //loadList_${p.n}();    `
    }

  }

  function doParentReset(p, ii) {
    const dcv1 = model[p.t]
    const l00 = []
    const ps1 = dcv1.ps
    return `
    item_${p.n}.value = {};    `
  }


  function doParentFor_JSCodeReturn(p, ii) {
    const dcv1 = model[p.t]
    const l00 = []
    const ps1 = dcv1.ps
    return `
      m_dc_${p.n},
      put_${p.n},
      loadList_${p.n}, ldco00_${p.n},updateAC_${p.n},
      item_${p.n},item_ac_${p.n},removeDC_${p.n},idxSelect_${p.n},
      `
  }


  //doAlls
  function doAllParentFor_000(fn, sep) {
    const sepF = sep ? sep : "";
    const parents = dcv.parents
    if(!parents){
      return ""
    }
    const l = []
    parents.filter((p) => {
      return p.setBySys === undefined
    }).forEach((p, i) => {
      l.push(fn(p, i))
    })
    return l.join(sepF)
  }

  function doFunctionAddDC00() {
    const l = []
    const l2 = []

    const parents = dcv.parents
    if (parents) {
      parents.filter((p) => {
        return p.setBySys === undefined
      }).forEach((p, i) => {

        l2.push(`item_${p.n}.value['id']!==undefined`)
      })
    }
    return l2.join(' && ')

  }

  function doAllParentsSelectForm() {
    return doAllParentFor_000(doParentSelectInForm)
  }

  function doAllParentFor_Selected_InForm() {
    return doAllParentFor_000(doParentFor_Selected_InForm)
  }

  function doAllParentFor_JSCodeInit() {
    return doAllParentFor_000(doParentFor_JSCodeInit)
  }

  function doAllParentFor_JSCode() {
    return doAllParentFor_000(doParentFor_JSCode)
  }


  function doAllParentFor_JSCodeReturn() {
    return doAllParentFor_000(doParentFor_JSCodeReturn)
  }


  function resetAllParentsJsCode() {
    return doAllParentFor_000(doParentReset)
  }

  function putSendValues() {
    const l = []
    const ps = dcv.ps
    if (ps) {
      ps.filter(p => p.n !== 'pkey' && p.setBySys === undefined).forEach(p => {
        if (p.t === 'LocalDateTime') {
          l.push(`
              it0['${p.n}'] =  d00;`)

        } else {

          l.push(`
          it0['${p.n}'] =  v0['${p.n}'];`)

        }

      })
    }
    const parents = dcv.parents
    if (parents) {
      parents.filter((p) => {
        return p.setBySys === undefined
      }).forEach(p => {

        l.push(`
              it0['${p.n}_id'] =  item_${p.n}.value['id'];`)
      })
    }
    return l.join("");
  }

  function writeUpdateFunction(dc00){
    if(dc00.parents && dc00.parents.length>0){
      return  `
const update = (k:string,pv,dcp,ldco00) => {
  if(pv){
    setTimeout(() => {
      let params: any = { max: 4, withCount: 0 };
      params[["il_",k].join("")] = pv;

      let payload = {
        dc: dcp,
        params: params,
      };

      doList(payload)
      .then((ldco) => {
        ldco00.value = ldco;
        //let n = ldco.l.length;
      //  if (n <= idxSelect.value) {
         // idxSelect.value = n - 1;
      //  }
        console.log(ldco);
      })
      .catch((error) => {
        console.log(error);
      });

    },265);

  }
};

`
    }
    return ""

    

  }


  function code() {
    return `
<template lang="pug">
h2 TO Addd ${dck}
div
  button(v-on:click="showSubWin('viewForm')") ADD ${dcMsg(dcv)}
  button(v-on:click="showSubWin('viewList')") Show List
  button(v-on:click="load_${dcv.dcname}(1)") LIST
     
hr

.dc-form-container(v-show="myUI['viewForm']===true" v-bind:class="'vl-form-box-'+subWin")
  .dc_p_container
    ${doAllParentsSelectForm()}
    
  .current-dc-0-item.item_${dcv.dcname}

    .el-item(v-if="item_${dcv.dcname}")
      .el-item-parents  
      ${doAllParentFor_Selected_InForm()}
      button.add(v-if="canAdd()" v-on:click="add_${dcv.dcname}()") AGREGAR 

    .oo-json {{item_${dcv.dcname}}}     


.l-dc-container(v-show="myUI['viewList']===true")
  .dc-0    
    h3.dc-h ${dcv.dcname}
    FVPagination(v-bind:ldc="m_dc_${dcv.dcname}",v-on:setPage0="setPage0") 
    table.blueTable(v-if="m_dc_${dcv.dcname} && m_dc_${dcv.dcname}.l")
      tbody
        tr.l-loop(v-for="e0 in m_dc_${dcv.dcname}.l", :key="'cdo_' + e0.id") 
          td.pkey {{ e0.pkey }}
          td.pname {{ e0.pname }}     
          td.thirdPerson_pname {{ e0.thirdPerson_pname }}
          td.departament_pname {{ e0.departament_pname }}
          td.baseTimePeriod_pkey {{ e0.baseTimePeriod_pkey }}
          td.departament_pname {{ e0.departament_pname }}
          td 
            router-link(:to="{name:'vl_${dcv.dcname}_detail',params:{${dcv.dcname}_id:e0.id}}") T


div 
  router-view


</template>
<script lang="ts">
import {  defineComponent, ref } from "vue";
import { useRouter } from "vue-router";
import  FVPagination  from "./FVPagination.vue";

import { doList, doSave } from "../store/DCModelStore";
export default defineComponent({
  name: "compra",
  components:{
    FVPagination
  },
  setup(props, context) {
    const router = useRouter()
    const m_dc_${dcv.dcname} = ref({});


    ${writeUpdateFunction(dcv)}

    const item_${dcv.dcname} = ref({
        ${doItem00()}
    });
    const setPage0 = (payload) => {
      load_${dcv.dcname}(payload.n)
    };

    //const subWins = ["viewForm", "viewUpXlsForm", "viewFilter"];
    const myUI = ref({
      viewForm: false,
      viewList: false            
    });
    const showSubWin = (eui) => {
      myUI.value[eui] = !myUI.value[eui];
    }

    ${doAllParentFor_JSCode()}

    /** MAIN DC ${dck} */
    const load_${dcv.dcname} = (n) => {
      const max = 8;
      const offset = max*(n- 1);
      const ${dcv.dcname}Payload = { dc: "${dcv.dcname}",params:{ withCount:"1",max:8,offset:offset} };
      doList(${dcv.dcname}Payload).then((rr) => {
        m_dc_${dcv.dcname}.value = rr;
      });
    };

    const add_${dcv.dcname} = () =>{
      const it0:any = {};

      const d00 = (new Date()).toISOString().substring(0,16);
      it0['pkey']=it0['pkey']=[Math.random(),'a'].join("-")
      const v0 = item_${dcv.dcname}.value;

      ${putSendValues()}
      const payload = {dc:'${dcv.dcname}',item:it0}
      doSave(payload).then((r)=>{
        if(r.id){
          router.push({ name: 'vl_${dcv.dcname}_detail', params: { ${dcv.dcname}_id:r.id } })
          ${resetAllParentsJsCode()}
        }

        console.log(r)
      }).catch((e)=>{
        console.log(e)
      })

    }

    const canAdd = () => {
      return ${doFunctionAddDC00()}
    }

    const select00 = (dcp:string,e0:any) =>{
      console.log(dcp,e0)
    }

    const init0 = () => {
      ${doAllParentFor_JSCodeInit()}
     
    };

    const select01 = () => {

    };
    

    
    init0();
    return {
      item_${dcv.dcname},
      m_dc_${dcv.dcname},
      setPage0,
      load_${dcv.dcname},
      add_${dcv.dcname},
      canAdd,select01,select00,
      /* puts to parents*/ 
      ${doAllParentFor_JSCodeReturn()}  
      myUI,showSubWin  

    };
  },
});
</script> 
<style>
${css1()}
</style>  `
  }

  toFile(fout, code())
}


function doOnPutChildParent(pp, p) {
  if (pp.n === 'product') {
    if (p.n === 'invoiceLines') {
      return `
      // ${p.t}
       item0_f_invoiceLines.value.price = e.price
       item0_f_invoiceLines.value.taxPorcent = e.taxPorcent
       `
    }

  }
  return ""
}

function putSendValues00(dcch, p0,dcv) {
  const l = []
  l.push(`
  const v0 = item0_f_${p0.n}.value;
  `)
  const ps = dcch.ps
  if (ps) {
    ps.filter(p => p.n !== 'pkey' && p.setBySys === undefined).forEach(p => {
      l.push(`
            it0['${p.n}'] =  v0['${p.n}'];`)

    })
  }
  const parents = dcch.parents
  if (parents) {
    parents.filter((p) => {
      return p.setBySys === undefined && p.n !== p0.onRelation
    }).forEach(p => {
      l.push(`
      //${p0.onRelation} ${p.n}
            it0['${p.n}_id'] =  item_${p.n}_f_${p0.n}.value['id'];`)
    })

  }
  l.push(`
         it0["${p0.onRelation}_id"] = ${dcv.dcname}.value.id
  `)

  return l.join("");
}


//.fn0
const template_formula = ((valElem, psFormulaElement) => {//vt value of template ,it0,  item, etc

  //const fn0 =  [{v:'askQuantity',t:'val'},{v:'*',t:'s'},{v:'price',t:'val'}]
  const fnR = ((k, e) => {
    if (e.t === 'val') {
      return [valElem, "['", e.v, "']"].join("")
    }
    if (e.t === 'por') {
      return [valElem, "['", e.v, "']*0.01"].join("")
    }
    if (e.t === 'n') {
      return e.v
    }
    return e.v
  })

  const l0_ = []
  l0_.filter((p) => { return pn.fn0!==undefined }).push(`
    ${valElem}[${psFormulaElement.n}] = `)
  for (let p in psFormulaElement.fn0) {

    l0_.push(fnR(p, psFormulaElement.fn0[p]))
  }
  return l0_.join("  ")
})


exports.doVuesDetail = function (fo, dck) {

  const dcv = model[dck]
  const childs = dcv.childs
  const hasChilds = (childs !== undefined && childs !== null && childs.length > 0);

  if (!dcv) {
    console.log("\n\t no object " + dck + " in model!!!!\n")
    return
  }
  const fout = `${fo}/FVlon${dck}Detail.vue`


  const onResponseExtendContent = (p3__)=>{
    if(p3__.n==="invoiceLines"){
      return    `
      if(res.l){
        extendElement_${p3__.n}(res.l)
        calcSums_invoiceLines(res)
      }   

      `
    }
    return ""
  }

//JS por child property
  function doLoadCh(p) {
    const dcch = model[p.t]

    const tiposLtJs = (p00) => {
      const t = p00.t
      const initJsVal = p00.initJsVal

      if (initJsVal) {
        return initJsVal
      }

      if (t === 'String') {
        return '""'
      }
      if (t === 'BigDecimal' || t === 'Integer' || t === 'Float' || t === 'Double') {
        if (p.min) {
          return p.min
        }
        return 0

      }
      return '""'

    }


    function doIt(p_) {
      const l00 = []
      const dcv_ = model[p_.t]
      const ps_ = dcv_.ps
      if (ps_) {
        ps_.forEach((p0) => {
          l00.push(`
          ${p0.n}: ${tiposLtJs(p0)}`)
        })

      }
      return `{${l00.join(",")}}`
    }

    const parents = dcch.parents
    const l01 = []




    parents.filter((pp) => {
      return pp.setBySys === undefined && p.onRelation !== pp.n
    })
      .forEach((pp) => {
        const dcch_dp = model[pp.t]

        const l_pjs=[]
        if(pp.dependsOn){
          pp.dependsOn.forEach((pDon)=>{
            l_pjs.push(`
            const ${pDon}0 = item_${pDon}_f_${p.n}.value;
            payload.params['${pDon}_id'] = ${pDon}0['id']
                        `)
          })
        }

        //Tiene como parent algo en comun  
        //// ---         payload.params['departament_id'] = departamentBaseTimePeriod.value['departament_id']

        const ppp_00 =  dcch_dp.parents
        const ppp_11 = dcv.parents
        const losQueTiene = []
        if(ppp_00 && ppp_11){
          ppp_00.forEach((dc00)=>{
            ppp_11.forEach((dc11)=>{
              if(dc00.t===dc11.t){
                losQueTiene.push([dc11.t,dc00.n])
              }
            
            })


          })

        }

        const losQueTiene2 = losQueTiene.map((e)=>{
          return `payload.params['${e[1]+"_id"}'] = ${dcv.dcname}.value['${e[1]+'_id'}']`
        })

        l01.push(`
      //AA DETAIL  Parent CHILD ${pp.n}

      const item_ac_${pp.n}_f_${p.n} = ref({});
      
      const m_dc_${pp.n}_f_${p.n} = ref({});
      const item_${pp.n}_f_${p.n} = ref({});
      const ldco00_${pp.n}_f_${p.n} = ref({});

      const loadList_${pp.n}_f_${p.n} = () => {
        const payload = { dc: "${dcch_dp.dcname}",params:{max:12}};
        ${l_pjs.join("")} 
        //Los que tienen en comun:: ${losQueTiene.join("--- ")}  
        /*
        ${losQueTiene2.join("\n")} 
        */
        doList(payload).then((res) => {
          m_dc_${pp.n}_f_${p.n}.value = res;
        });
      };  

      const updateAC_${pp.n}_f_${p.n} =(k:string)=>{            
        const v = item_ac_${pp.n}_f_${p.n}.value;
        const pv  =  v[k] //
        update(k,pv,"${dcch_dp.dcname}",ldco00_${pp.n}_f_${p.n})
      } 

      //PUT ${pp.n} for ${p.n}
      const put_${pp.n}_f_${p.n} = (e,o) =>{
        item_${pp.n}_f_${p.n}.value=  e;

        ${doOnPutChildParent(pp, p)}

        if(o){
          ldco00_${pp.n}_f_${p.n}.value={l:[]}
        }

      }

    `)

      })

    return `  

  const m_dc_${p.n} = ref({l:[]})
  const item0_f_${p.n} = ref(${doIt(p)})
  const error_f_${p.n} = ref({})
  
  const add_${p.n} = () =>{
    const it0:any = {};
    it0['pkey']=[Math.random(),'a'].join("-")

    ${putSendValues00(dcch, p,dcv)}
    
    const payload = {dc:'${dcch.dcname}',item:it0}
    doSave(payload).then((r)=>{
      console.log("added ${p.n}")
      console.log(r)
    }).catch((e)=>{
      handleError(e,error_f_${p.n})      
    })

  }  

  const loadList_${p.n} = () => {
    const payload = { dc: "${dcch.dcname}",params:{${p.onRelation}_id:${dcv.dcname}.value.id,max:120} };
    doList(payload).then((res:any) => {
      m_dc_${p.n}.value = res;
      ${onResponseExtendContent(p)}  

    });
  }; 
 
  ${l01.join("\n")}
  `
  }


  function customExtraContentForChildHtml(p3) {
    if (p3.n === "invoiceLines" && dcv.dcname === "purchase") {
      return `

          .a.frm-gpo
            .ctls          
              button.load-list-racks(v-on:click="loadList_Racks()") stockRacks
            .ctls-res(v-if="m_dc_stockRacks && m_dc_stockRacks.l") 
              h3 list of stockRack
              template(v-for="r in m_dc_stockRacks.l") 
                button(v-on:click="put_stockRack(r, 1)")
                  span.pkey {{ r.pkey }} &nbsp;
                  span.pname {{ r.pname }}
              .btns    
              button(v-on:click="add_stockRackProduct()") assignar
              hr  
  
              
    `
    }
    return ""
  }


  function customExtraContentForChildReturn(p3) {
    const dch00 = model[p3.t]
    const psFormula = dch00.psFormula

    const sumas_gral0 = () => {
      //const _l = []      
      if (psFormula && psFormula.length > 0) {
        return `,sums_vars_${p3.n}`
      }
      return ""

    }

    if (p3.n === "invoiceLines") {

      const ll= []

      if(dcv.dcname === "purchase"){
        ll.push(`
        loadList_Racks,        
        m_dc_stockRacks,
        add_stockRackProduct,
        item_stockRack, put_stockRack,
        `)
      }
      

      return `${ll.join("")}
      item0_f_${p3.n}_psFormula_subtotal,
      item0_f_${p3.n}_psFormula_descountUnit,
      item0_f_${p3.n}_psFormula_descountTotal,
      item0_f_${p3.n}_psFormula_subtotal2,
      item0_f_${p3.n}_psFormula_tax,
      item0_f_${p3.n}_psFormula_total

      ${sumas_gral0()}
      `
    }
    return ""
  }

  function customExtraContentForChild(p3) {
    const dcch0 = model[p3.t]
    const psFormula = dcch0.psFormula

    const extEle0 = (nn) => {
      if (psFormula) {
        const _l = []
        psFormula.filter((pFE)=>{return pFE.fn0!==undefined}).forEach((pFE) => {
          _l.push(`
          e0['${pFE.n}'] = ${template_formula("e0", pFE)} `)
        })
        return  `
        const extendElement_${nn} = (l)=>{
          l.forEach((e0)=>{
            ${_l.join("")}
          })
          
         }               
        `
      } 
      return ""
    }

    const sumas_gral = (nE) => {
      const _l = []
      const _l0 = []

      if (psFormula) {
        _l0.push("n:0")
        psFormula.filter((pFE) => {
          return pFE.ignoreInSum !== true
        }).forEach((pFE) => {
          _l0.push(` ${pFE.n}:0`)
          _l.push(`
          sums_['${pFE.n}']+=e['${pFE.n}']  `)
        })

        return `
        const sums_vars_${p3.n} = ref({
          ${_l0.join(",")}
        })
   
        const calcSums_${p3.n} = (m)=>{
          if(m){
            const l = m.l
            if(l){
             const  sums_ = { ${_l0.join(",")}
            }            
            l.forEach((e)=>{
               sums_['n']++
               ${_l.join("")}
            })
            sums_vars_${p3.n}.value=sums_
            }
          }
        }

        `

      }
      return "//No sums for ${p3.n}"

    }



    if (p3.n === "invoiceLines") {
        const lr = []
        lr.push(`
        ${sumas_gral(p3.n)}
        ${extEle0(p3.n)}
        //----`)

        lr.push(`
        // Ztats

const item0_f_${p3.n}_psFormula_subtotal = computed(()=>{
  const v = item0_f_${p3.n}.value      
    return v.askQuantity*v.price
 })  
 
 const item0_f_${p3.n}_psFormula_descountUnit = computed(()=>{ 
  const v = item0_f_${p3.n}.value   
    return v.price*v.descountPorcent*0.01
 })  


 const item0_f_${p3.n}_psFormula_descountTotal = computed(()=>{
  
  const v = item0_f_${p3.n}.value  
  const v_descountUnit = item0_f_${p3.n}_psFormula_descountUnit.value    
    return v.askQuantity*v_descountUnit
 })  


 const item0_f_${p3.n}_psFormula_subtotal2 = computed(()=>{
  
  const v_subtotal = item0_f_${p3.n}_psFormula_subtotal.value
  const v_descountTotal = item0_f_${p3.n}_psFormula_descountTotal.value    
    return v_subtotal-v_descountTotal
 })  

 const item0_f_${p3.n}_psFormula_tax = computed(()=>{
  const v = item0_f_${p3.n}.value 
  const v_subtotal2 = item0_f_${p3.n}_psFormula_subtotal2.value
  
    return v_subtotal2*v.taxPorcent*0.01
 }) 

 const item0_f_${p3.n}_psFormula_total = computed(()=>{
  
  const v_subtotal2 = item0_f_${p3.n}_psFormula_subtotal2.value
  const v_tax = item0_f_${p3.n}_psFormula_tax.value
  
    return v_subtotal2 + v_tax
 }) 



        `)      

if(dcv.dcname==="purchase"){
  lr.push(`

  /**
   * StockRack List
   */

  const m_dc_stockRacks = ref({});//////

  const loadList_Racks = () => {
    const payload = { dc: "stockRack" };
    doList(payload).then((res: any) => {
      console.log(res);
      m_dc_stockRacks.value = res;
    });
  };

  const item_stockRack = ref({ id: -1 });
  const ldco00_stockRack = ref({});
  const put_stockRack = (e, o) => {
    item_stockRack.value = e;

    if (o) {
      ldco00_stockRack.value = { l: [] };
    }
  };

  /**
   * StockRackProduct List
   */

  
  const add_stockRackProduct = () => {
    const product0 = item_product_f_invoiceLines.value;
    const stockRack0 = item_stockRack.value;
    if (product0 && stockRack0) {

      if(product0['id']===undefined){
        alert("Add product first!")
        return
      }
      if(stockRack0['id']===undefined){
        alert("Add stockRack first!")
        return
      }

      const pkey = product0['pkey']+":"+stockRack0['pkey']
      const pname = product0['pname']+" para "+stockRack0['pname']
      const it0 = { pkey: pkey,pname:pname,quantity:0,serialNumber:"SSN"};
      it0["product_id"] = product0["id"];
      it0["stockRack_id"] = stockRack0["id"];
      const payload = { dc: "stockRackProduct", item: it0 };
      doSave(payload)
        .then((r) => {
          console.log("stockRackProduct--->");
          console.log(r);
        })
        .catch((e) => {
          console.log(e);
        });
    }
  };  
  
  `)
}
      return lr.join("")
    }

    return ""

  }


  function asTd(nCol, pp) {
    const lr = ['span', 'ch','sp-td', nCol]
    if (pp.cssClass) {
      lr.push(pp.cssClass)
    }
    return `
                td.td0
                  
                    ${lr.join(".")} {{r['${nCol}']}}    `
  }
  function asInTdP(pp) {
    return `
                    li.${pp.n} {{r['${pp.n}_pname']}}      `

  }
  function asInThP(pp) {
    return `
                    li.${pp.n} ${pp.n}      `

  }

  function asTh(nCol, pp) {
    const lr = ['span', 'sp-th', nCol]
    if (pp.cssClass) {
      lr.push(pp.cssClass)
    }
    return `
                th
                  
                    ${lr.join(".")}  ${pp.n} `
  }


  //HTML
  function doChildForm() {
    if (!hasChilds) {
      return `
      //NCH  EL dck = ${dck}
      `
    }

    function doEl00__(p3, fnApplyOnPs, fnApplyOnParent) {
      const lr = []
      const dcch00_ = model[p3.t]
      const parents_ = dcch00_.parents
      //lr.push(`
        //        tr.l-${p3.n}(v-for="(r,idx) in m_dc_${p3.n}.l", :key="'l-${p3.n}-'+r.id") `)

      if (parents_) {
        lr.push(`                
                th   
                  ul`)
        parents_.forEach((parentOfChild) => {
          if (p3.onRelation !== parentOfChild.n) {
            lr.push(fnApplyOnParent(parentOfChild))
          }
        })
      }
      
      const tableCols = dcch00_.tableCols
      const ps = dcch00_.ps
      if (tableCols) {
        
        const psF = dcch00_.psFormula
        tableCols.forEach((nCol) => {
          if (ps) {
            const idx00 = ps.findIndex((p) => { return p.n === nCol })
            if (idx00 > -1) {
              const pp = ps[idx00]
              lr.push(fnApplyOnPs(nCol, pp))
            }
          }
          if (psF) {
            const idx01 = psF.findIndex((p) => { return p.n === nCol })

            if (idx01 > -1) {
              const pp = psF[idx01]
              lr.push(fnApplyOnPs(nCol, pp))
            }
          }
        })
      }else{
        if (ps) {
          ps.forEach((p__)=>{
            lr.push(fnApplyOnPs(p__.n, p__))
          })
          
        }

      }
      return `
          ${lr.join("")}
      `
    }


    function doEl00TH(p3) {

      dcch00 = model[p3.t]

      if (p3.n === "invoiceLines") {
        return `          
            ${doEl00__(p3, asTh, asInThP)}
        `
      }
      if (p3.n === "payments") {
        return  doEl00__(p3, asTh, asInThP)
      }
      return doEl00__(p3, asTh, asInThP)

    }


    function doEl00(p3) {
      if (p3.n === "invoiceLines") {
        return doEl00__(p3, asTd, asInTdP)
      }
      if (p3.n === "payments") {
        return  doEl00__(p3, asTd, asInTdP)

      }
      return doEl00__(p3, asTd, asInTdP)
    }


    function doChildForm00(p3) {
      const l00 = []
      const l01 = []

      const dcch = model[p3.t]
      const ps = dcch.ps
      const parents = dcch.parents
      //autocomplete
      const d_resAc = (pOfChild) => {
        return `
                .resac
                  .resacf1(v-if="ldco00_${pOfChild.n}_f_${p3.n} && ldco00_${pOfChild.n}_f_${p3.n}.l")
                    .resac-e(v-for="(e0, i0) in ldco00_${pOfChild.n}_f_${p3.n}.l",:key="e0.id"  v-on:click="put_${pOfChild.n}_f_${p3.n}(e0,1)")
                      span.pkey {{e0.pkey}}
                  .item-dc-p2(v-if="item_${pOfChild.n}_f_${p3.n} && item_${pOfChild.n}_f_${p3.n}.id" ) 
                    h3 {{item_${pOfChild.n}_f_${p3.n}.pname}}
                    .it2-pkey ---- {{ item_${pOfChild.n}_f_${p3.n}.pkey }}      
            
        `
      }

      if (parents) {
        parents.filter((parentOfChild) => {
          return parentOfChild.setBySys === undefined
        })
          .forEach((parentOfChild) => {

            if (p3.onRelation !== parentOfChild.n) {

              let elIfOnDepensOn = ""
              if(parentOfChild.dependsOn){
                const ss = parentOfChild.dependsOn.map((e)=>{
                      const nvar = `item_${e}_f_${p3.n}`
                      return `${nvar} && ${nvar}.id`
                }).join(" && ")                
                elIfOnDepensOn = `.depend-on(v-if="${ss}") `
              }

              l01.push(`            
              div.a.frm-gpo.${parentOfChild.n}${elIfOnDepensOn}
                button(v-on:click="loadList_${parentOfChild.n}_f_${p3.n}()") Load
                label.ffa 
                  span  ${parentOfChild.n} `)


              l01.push(`              
                input(name="${parentOfChild.n}", type="text", v-model="item_ac_${parentOfChild.n}_f_${p3.n}['pkey']" ,autocomplete="off",placeholder="buscar",@input="updateAC_${parentOfChild.n}_f_${p3.n}('pkey')",v-on:keyup.enter="select01()") `)
              l01.push(d_resAc(parentOfChild))


              l01.push(`
                .ls-p-res(v-if="m_dc_${parentOfChild.n}_f_${p3.n} && m_dc_${parentOfChild.n}_f_${p3.n}.l") 
                  h3 list of ${parentOfChild.n} for ${p3.n}
                  .l-box
                    .box(v-for="r in m_dc_${parentOfChild.n}_f_${p3.n}.l")
                      button(v-on:click="put_${parentOfChild.n}_f_${p3.n}(r)") 
                        .elem-${parentOfChild.n}-f-${p3.n} {{r.pname}} 
                        .elem-p rprice
                      
                    
              
              `)
              

            }

          })
      }
      //PS 

      l01.push(`
        ${customExtraContentForChildHtml(p3)}      
      `)

      const esIgnorada = (p_) => {
        const v = dcch.ignoreInDetailCustom
        return v && v[p_.n]
      }
      //Form detail
      if (ps) {
        ps.filter((p0) => { return esIgnorada(p0) === undefined }).forEach((p0) => {
          l00.push(`
            div.a
              label.ff-detail-bb 
                span.ffa1 ${p0.n} `)
          if (p0.t === "String") {
            if (p0.inList !== undefined) {
              l00.push(`
              select(name="${p0.n}" v-model="item0_f_${p3.n}['${p0.n}']")`)
              p0.inList.forEach((pe) => {
                l00.push(`
                option(value="${pe}") ${pe}        `)
              })

            } else {
              l00.push(`
                input(name="${p0.n}" type="${doTSTipoForm(p0.t)}" v-model="item0_f_${p3.n}['${p0.n}']")`)
            }

          } else {
            l00.push(`
                input(name="${p0.n}" type="${doTSTipoForm(p0.t)}"  v-model="item0_f_${p3.n}['${p0.n}']")`)
          }
          l00.push(`
              p(v-if="error_f_${p3.n} && error_f_${p3.n}['${p0.n}']")
                span.error {{error_f_${p3.n}['${p0.n}']}}            
          `)
          //
        })
      }

      const psFormula = dcch.psFormula

      const l_psFormula = []
      const l_sumVar = []


      if (psFormula) {
        l_sumVar.push(`
          .sums-vars
        `)


        psFormula.filter((pf)=>{
          return pf.ignoreInSum !== true
        }).forEach((pf) => {
          let elVal_sums =`sums_vars_${p3.n}['${pf.n}']`
          let elVal_item_f =`item0_f_${p3.n}_psFormula_${pf.n}`
          if(pf.jsFmt){
            elVal_sums= `${pf.jsFmt}(${elVal_sums})`
            elVal_item_f= `${pf.jsFmt}(${elVal_item_f})`
          }

          l_sumVar.push(`  
              p.${pf.n}
                label ${pf.n}
                span  {{${elVal_sums}}}
          `)
          l_psFormula.push(`
              p.item0.${pf.n}
                label ${pf.n}
                span {{${elVal_item_f}}}         `)

        })
      }

      return `
      .dcp2.${p3.n}

        .title ${p3.n}
        ${l_sumVar.join("")}
        .form_full 
          .ppp_form2 
          ${l01.join("")}
          
          .form2          
            ${l00.join("")}
          .item0-ps-formula
            ${l_psFormula.join("")}            


          
        div.a         
          button(v-on:click="add_${p3.n}")  Add
        
    
        .tab-container 
          table.blueTable.m_dc_${p3.n}(v-if="m_dc_${p3.n} && m_dc_${p3.n}.l")
            thead
              tr 
                th 
                  span -
                ${doEl00TH(p3)}                             
            tbody
              tr.l-${p3.n}(v-for="(r,idx) in m_dc_${p3.n}.l", :key="'l-${p3.n}-'+r.id")
                th 
                  span.idx {{(idx as number + 1 )}}
                  ${doEl00(p3)}

      `
    }
    //const item_ac_contract = ref({});
    const l0 = []

    childs.forEach(p2 => {
      l0.push(`
      ${doChildForm00(p2)}`)
    })
    return l0.join("")
  }

  function doChildsLoad() {
    if (!hasChilds) {
      return `/**  NOCH*/`
    }

    const l0 = []
    childs.forEach(p => {

      l0.push(`
        loadList_${p.n}();`)
    })

    return l0.join("\n")
  }
//JS RETURN
  function doChildsReturn() {
    if (!hasChilds) {
      return "";
    }
    const l0 = []

    childs.forEach(p3 => {
      const dcch = model[p3.t]
      l0.push(`
//
        m_dc_${p3.n},loadList_${p3.n},item0_f_${p3.n},add_${p3.n},error_f_${p3.n}      
        `)
      const parents = dcch.parents
      if (parents) {
        parents.filter((pp) => {
          return pp.setBySys === undefined && p3.onRelation !== pp.n
        }).forEach((pp) => {
          const dcch_dp = model[pp.t]
          l0.push(` 
///${pp.n}
    loadList_${pp.n}_f_${p3.n},m_dc_${pp.n}_f_${p3.n},
      item_${pp.n}_f_${p3.n},item_ac_${pp.n}_f_${p3.n},updateAC_${pp.n}_f_${p3.n},ldco00_${pp.n}_f_${p3.n},put_${pp.n}_f_${p3.n}`)
      
        })

        l0.push(`
//Custom for ${p3.n}        
        ${customExtraContentForChildReturn(p3)} 
//End Custom for ${p3.n}              
        `)

      }

    })

    return l0.join(",\n")

  }


//JS CODE
  function doChilds() {
    if (!hasChilds) {
      return "";
    }
    const l0 = []
    childs.forEach(p_ch => {
      l0.push(`
          ${doLoadCh(p_ch)}
          `)
      l0.push(`
      ${customExtraContentForChild(p_ch)}
      `)

    })
    return l0.join("");
  }


  function code() {

    return `
<template lang="pug">
h2 Detail for ${dck}
.${dcv.dcname} {{ ${dcv.dcname}_id }} {{ ${dcv.dcname}.pname }} 

.ff_detail
  ${doChildForm()}
</template>

<script lang="ts">

import { computed, ref } from "@vue/reactivity";
import { defineComponent, watch } from "vue";
import { useRoute } from "vue-router";
import { doList,doSave,handleError,formatPrice} from "../store/DCModelStore";
export default defineComponent({
  name: "${dcv.dcname}-detail" /**      ******* */,
  setup(props, context) {

    /*
    const sumL = (m,k) =>{
      const l = m.v.l
      if(l){        
        return l.reduce( (acc, currVal) => acc + currVal,0)
      }
      return 0
    }*/
    
    const update = (k:string,pv,dcp,ldco00) => {
      if(pv){
        setTimeout(() => {
          let params: any = { max: 4, withCount: 0 };
          
          params[["il_",k].join("")] = pv;

          let payload = {
            dc: dcp,
            params: params,
          };

          doList(payload)
          .then((ldco) => {
            ldco00.value = ldco;
            //let n = ldco.l.length;
          //  if (n <= idxSelect.value) {
             // idxSelect.value = n - 1;
          //  }
            console.log(ldco);
          })
          .catch((error) => {
            console.log(error);
          });

        },265);

      }
  };


    const route = useRoute();

    const ${dcv.dcname} = ref({
        pkey:String,id:Number,pname:String
    })

    const ${dcv.dcname}_id = computed(() => {
      return route.params.${dcv.dcname}_id;
    });

    const load = ()=>{
      const p = {dc:'${dcv.dcname}',params:{id:route.params.${dcv.dcname}_id,max:1}}
      ;
      doList(p).then((r)=>{
        if(r && r.l && r.l.length>0){
          ${dcv.dcname}.value=r.l[0];
          ${doChildsLoad()}
        }
      
      }).catch((e)=>{
        console.log(e)
      })
    }

  
${doChilds()}
  
    watch(${dcv.dcname}_id,()=>{
      load();
    })

    const init0 = () => {
      setTimeout(()=>{
       load() ,285
      })
 
    };

    init0()
    return {
      ${dcv.dcname}_id,${dcv.dcname},formatPrice,
      ${doChildsReturn()}
    };
  },
});
</script>
<style>
${css2()}

</style> `
  }

  toFile(fout, code())



}
