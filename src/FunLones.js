import { DCJsModel, ModelILon, SMTO, SOTM, SProperty } from "./ModelLon"
const model: ModelILon = require('./modelo.js').model

export function doSimpleMap(dck: string, dcv: DCJsModel) {

    const m:any = {}
  

    if (dcv.parents) {
        const parents = dcv.parents
        m['1'] = []
        m['2'] = []
        m['3'] = []
        parents.forEach((p: SMTO) => {

            const dcv1: DCJsModel = model[p.t]
            const parents2: Array<SMTO> | undefined = dcv1.parents
            if (parents2) {
                parents2.forEach((p2: SMTO) => {
                    const dcv2: DCJsModel = model[p2.t]
                    const parents3: Array<SMTO> | undefined = dcv2.parents
                    if (parents3) {
                        parents3.forEach((p3: SMTO) => {
                            
                            p3.fromSMTO = p2.nUp;
                            p3.fromSMTO2 =p.nUp;

                            m['3'].push(p3)
                        })
                    }
                   
                    p2.fromSMTO = p.nUp
                    m['2'].push(p2)

                })
            }

            m['1'].push(p)
            
        })
    }

    return m
}

