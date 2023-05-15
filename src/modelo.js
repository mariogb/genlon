
const putInvoiceItemsProperties = (dck, _modelo) => {

    const dcv = _modelo[dck]

    dcv['psFormula'] = [
        {
            n: 'subtotal',//askQuantity * price
            t: 'BigDecimal',

            fn0: [
                { v: 'askQuantity', t: 'val' },
                { v: '*', t: 's' },
                { v: 'price', t: 'val' }
            ],
            jsFmt: 'formatPrice',
            cssClass: 'currency'
        },
        {
            n: 'descountUnit',
            t: 'BigDecimal',
            ignoreInSum: true,
            jsFmt: 'formatPrice',
            fn0: [
                { v: 'price', t: 'val' },
                { v: '*', t: 's' },
                { v: 'descountPorcent', t: 'por' },

            ]
            , cssClass: 'currency'
        },
        {
            n: 'descountTotal',
            t: 'BigDecimal',
            jsFmt: 'formatPrice',
            fn0: [
                { v: 'descountUnit', t: 'val' },
                { v: '*', t: 's' },
                { v: 'askQuantity', t: 'val' }
            ],
            cssClass: 'currency'
        },
        {
            n: 'subtotal2',
            t: 'BigDecimal',
            jsFmt: 'formatPrice',

            fn0: [
                { v: 'subtotal', t: 'val' },
                { v: '-', t: 's' },
                { v: 'descountTotal', t: 'val' }

            ]

        },
        {
            n: 'tax',
            t: 'BigDecimal',
            jsFmt: 'formatPrice',
            fn0: [
                { v: 'subtotal2', t: 'val' },
                { v: '*', t: 's' },
                { v: 'taxPorcent', t: 'por' },
            ],
            cssClass: 'currency'
        },
        {
            n: 'total',
            t: 'BigDecimal',
            jsFmt: 'formatPrice',
            fn0: [
                { v: 'subtotal2', t: 'val' },
                { v: '+', t: 's' },
                { v: 'tax', t: 'val' }
            ],
            cssClass: 'currency'
        }
    ]
}


const model = {

    UserLon: {
        dcMsg: 'Usuario',
        lDcMsg: 'Usuarios',
        ps: [{
            n: 'pname',
            t: 'String',
            size: 128,
            l: 'Nombre'
        },
        {
            n: 'username',
            t: 'String',
            size: 32,
            withIndex: true,
            unique: true,
            l: 'Clave de usuario'
        },
        {
            n: 'password',
            t: 'String',
            size: 128,
            isPassword: true,
            l: 'Contraseña'
        },
        {
            n: 'email',
            t: 'String',
            size: 128,
            withIndex: true,
            unique: true,
            l: 'Correo'
        },
        {
            n: 'typeLon',
            t: 'String',
            size: 32,
            inList: ['ADM', 'SUBADM', 'AGENT', 'THIRD'],
            l: 'Tipo usuario'
        },
        {
            n: 'enabled',
            t: 'Boolean',
            defaultVal: true,
            l: 'Activa'
        }

        ],
        childs: [{
            n: 'departamentUserLons',
            t: 'DepartamentUserLon',
            l: 'Departamentos'
        },
        {
            n: 'programUserLons',
            t: 'ProgramUserLon',
            l: 'Programas'
        },
        {
            n: 'baseUserLons',
            t: 'BaseUserLon',
            l: 'Sedes'
        },
        {
            n: 'sales',
            t: 'Sale',
            onRelation: 'userAutor',
            l: 'Ventas'
        },
        {
            n: 'purchases',
            t: 'Purchase',
            onRelation: 'userAutor',
            l: 'Compras'
        },
        {
            n: 'userRoles',
            t: 'UserRole',
            l: 'Roles'
        },
        {
            n: 'userThirdPersons',
            t: 'UserThirdPerson',
            l: 'Terceros'
        },
        ]
    },

    Role: {
        ps: [{
            n: 'pname',
            t: 'String',
            unique: true,
            size: 128
        }],
        childs: [{
            n: 'userRoles',
            t: 'UserRole'
        }, {
            n: 'entityPermisionRoles',
            t: 'EntityPermisionRole'
        }]
    },
    UserRole: {
        parents: [{
            n: 'userLon',
            t: 'UserLon'
        },
        {
            n: 'role',
            t: 'Role'
        },
        ]
    },
    UserThirdPerson: {
        parents: [{
            n: 'userLon',
            t: 'UserLon'
        },
        {
            n: 'thirdPerson',
            t: 'ThirdPerson'
        },
        ]
    },

    ThirdPerson: {
        // tableName :'el_tercero',
        dcMsg: 'Tercero',
        lDcMsg: 'Terceros',
        ps: [{
            n: 'pname',
            t: 'String',
            size: 128
        },
        {
            n: 'tipo',
            t: 'String',
            size: 16,
            inList: ['FISICA', 'MORAL'],
            withIndex: true
        },
        {
            n: 'rfc',
            t: 'String',
            size: 16,
            unique: true,
            withIndex: true
        }

        ],
        childs: [{
            n: 'purchaseContracts',
            t: 'PurchaseContract'
        },
        {
            n: 'saleContracts',
            t: 'SaleContract'
        },
        {
            n: 'userThirdPersons',
            t: 'UserThirdPerson'
        },
        ]

    },

    EntityPermisionRole: {
        ps: [{
            n: 'permission',
            t: 'String',
            size: 16,
            withIndex: true,
            inList: ["BROWSE", "LIST", "SAVE", "UPDATE", "DEL", "LZTAT", "EXXSLX", "IMPORTEXCEL", "TEMPLATEEXCEL"]
        },
        {
            n: "nombre",
            t: "String",
            size: 64
        },
        {
            n: 'enabled',
            t: 'Boolean',
            defaultVal: true
        }
        ],
        parents: [{
            n: 'role',
            t: 'Role'
        }]
    },

    Base: {
        dcMsg: 'Sede',
        lDcMsg: 'Sedes',
        ps: [{
            n: 'pname',
            t: 'String',
            unique: true,
            size: 128
        },],
        childs: [{
            n: 'baseTimePeriods',
            t: 'BaseTimePeriod'
        },
        {
            n: 'warehouses',
            t: 'Warehouse'
        },
        {
            n: 'baseUserLons',
            t: 'BaseUserLon'
        }
        ]

    },
    TimePeriod: {
        ps: [{
            n: 'pname',
            t: 'String',
            size: 128,
            unique: true
        },
        {
            n: 'beginDate',
            t: 'LocalDate'
        },
        {
            n: 'endDate',
            t: 'LocalDate'
        },
        {
            n: 'typeLon',
            t: 'String',
            size: 16,
            inList: ['CONFIG', 'OPERATION', 'FINISH']
        }
            //
        ],
        childs: [{
            n: 'baseTimePeriods',
            t: 'BaseTimePeriod'
        }]
    },

    BaseTimePeriod: {
        parents: [{
            n: 'base',
            t: 'Base'
        },
        {
            n: 'timePeriod',
            t: 'TimePeriod'
        }
        ],
        childs: [{
            n: 'departamentBaseTimePeriods',
            t: 'DepartamentBaseTimePeriod'
        },
        {
            n: 'programBaseTimePeriods',
            t: 'ProgramBaseTimePeriod'
        }
        ],
        parentsRestrict: ['base', 'timePeriod'],
        autoPkey: {
            formula: ['${base.pkey}:${timePeriod.pkey}']
        }
    },
    Warehouse: {
        ps: [{
            n: 'pname',
            t: 'String',
            size: 128
        },
        {
            n: 'typeLon',
            t: 'String',
            size: 16,
            inList: ['BUILD', 'MOVIL']
        }
        ],
        parents: [{
            n: 'base',
            t: 'Base'
        }],
        childs: [{
            n: 'workSpaces',
            t: 'WorkSpace'
        }]

    },

    WorkSpace: {
        ps: [{
            n: 'pname',
            t: 'String',
            size: 128
        },
        {
            n: 'capacity',
            t: 'Long'
        },
        {
            n: 'type',
            t: 'String',
            inList: ['Caja', 'Bodega', 'Oficina', 'Aula', 'Transporte']
        }
        ],
        parents: [{
            n: 'warehouse',
            t: 'Warehouse'
        }],
        childs: [{
            n: 'appointments',
            t: 'Appointment'
        },
        {
            n: 'stockRack',
            t: 'StockRack'
        }
        ]
    },

    Departament: {
        ps: [{
            n: 'pname',
            t: 'String',
            size: 128,
            unique: true
        },
        {
            n: 'description',
            t: 'String',
            size: 256,
            nullable: true
        },
        {
            n: 'fastKey',
            t: 'String',
            nullable: true,
            withIndex: true
        }
        ],
        childs: [{
            n: 'departamentBaseTimePeriods',
            t: 'DepartamentBaseTimePeriod'
        },
        {
            n: 'departamentUserLons',
            t: 'DepartamentUserLon'
        },
        {
            n: 'departamenJobs',
            t: 'DepartamentJob'
        },

        ]
    },
    DepartamentJob: {
        ps: [{
            n: 'pname',
            t: 'String',
            size: 128,
            unique: true
        },
        {
            n: 'description',
            t: 'String',
            size: 256,
            nullable: true
        },
        {
            n: 'fastKey',
            t: 'String',
            nullable: true,
            withIndex: true
        },
        {
            n: 'nhoras',
            t: 'Integer'
        }
        ],
        parents: [{
            n: 'departament',
            t: 'Departament'
        }],
        childs: [{
            n: 'departamentJobInstances',
            t: 'DepartamentJobInstance'

        },
        {
            n: 'programJobs',
            t: 'ProgramJob'

        }
        ]
    },
    DepartamentJobInstance: {
        ps: [{
            n: 'pname',
            t: 'String',
            size: 128,
            unique: true
        },
        {
            n: 'description',
            t: 'String',
            size: 256,
            nullable: true
        },
        {
            n: 'nhoras',
            t: 'Integer'
        }
        ],
        parents: [{
            n: 'departamentJob',
            t: 'DepartamentJob'
        },
        {
            n: 'departamentBaseTimePeriod',
            t: 'DepartamentBaseTimePeriod'
        }

        ],
        childs: [{
            n: 'appointmens',
            t: 'Appointment'
        }]
    },
    Program: {
        ps: [{
            n: 'pname',
            t: 'String',
            size: 128,
            unique: true
        },
        {
            n: 'description',
            t: 'String',
            size: 256,
            nullable: true
        },
        {
            n: 'fastKey',
            t: 'String',
            nullable: true,
            withIndex: true
        }
        ],
        childs: [{
            n: 'programBaseTimePeriods',
            t: 'ProgramBaseTimePeriod'
        },
        {
            n: 'programUserLons',
            t: 'ProgramUserLon'
        },

        {
            n: 'programJobs',
            t: 'ProgramJob'
        }
        ]
    },
    ProgramJob: {
        ps: [{
            n: 'pname',
            t: 'String',
            size: 128,
            unique: true
        },
        {
            n: 'description',
            t: 'String',
            size: 256,
            nullable: true
        },
        {
            n: 'fastKey',
            t: 'String',
            nullable: true,
            withIndex: true
        },
        {
            n: 'nhoras',
            t: 'Integer'
        }
        ],
        parents: [{
            n: 'program',
            t: 'Program',

        },
        {
            n: 'departamentJob',
            t: 'DepartamentJob',

        }

        ]
    },

    DepartamentUserLon: {
        parents: [{
            n: 'departament',
            t: 'Departament'
        },
        {
            n: 'userLon',
            t: 'UserLon'
        }
        ],
        parentsRestrict: ['departament', 'userLon']
    },
    ProgramUserLon: {
        parents: [{
            n: 'program',
            t: 'Program'
        },
        {
            n: 'userLon',
            t: 'UserLon'
        }
        ],
        parentsRestrict: ['program', 'userLon']

    },

    BaseUserLon: {
        parents: [{
            n: 'base',
            t: 'Base'
        },
        {
            n: 'userLon',
            t: 'UserLon'
        }
        ],
        parentsRestrict: ['base', 'userLon']
    },


    DepartamentBaseTimePeriod: {
        parents: [{
            n: 'baseTimePeriod',
            t: 'BaseTimePeriod'
        },
        {
            n: 'departament',
            t: 'Departament'
        }
        ],
        childs: [{
            n: 'purchaseContracts',
            t: 'PurchaseContract'
        },
        {
            n: 'departamentJobInstances',
            t: 'DepartamentJobInstance'
        },

        ],
        parentsRestrict: ['baseTimePeriod', 'departament']

    },
    ProgramBaseTimePeriod: {
        parents: [{
            n: 'baseTimePeriod',
            t: 'BaseTimePeriod'
        },
        {
            n: 'program',
            t: 'Program'
        }
        ],
        childs: [{
            n: 'saleContracts',
            t: 'SaleContract'
        }],
        parentsRestrict: ['baseTimePeriod', 'program']

    },

    PurchaseContract: {
        ps: [{
            n: 'pname',
            t: 'String',
            size: 128
        },],
        parents: [{
            n: 'departamentBaseTimePeriod',
            t: 'DepartamentBaseTimePeriod'
        },
        {
            n: 'thirdPerson',
            t: 'ThirdPerson'
        }
        ],
        childs: [{
            n: 'appointments',
            t: 'Appointment'
        },
        {
            n: 'purchases',
            t: 'Purchase'
        }
        ],
    },
    SaleContract: {
        ps: [{
            n: 'pname',
            t: 'String',
            size: 128
        },],
        parents: [{
            n: 'programBaseTimePeriod',
            t: 'ProgramBaseTimePeriod'
        },
        {
            n: 'thirdPerson',
            t: 'ThirdPerson'
        }
        ],
        childs: [{
            n: 'sales',
            t: 'Sale'
        }]
    },


    SaleType: {
        ps: [{
            n: 'pname',
            t: 'String',
            size: 128
        },
        {
            n: 'afectStock',
            t: 'String',
            size: 8,
            inList: ['NO', 'RESERVE', 'YES']
        }
        ],
        childs: [{
            n: 'sales',
            t: 'Sale'
        }]
    },
    PurchaseType: {
        ps: [{
            n: 'pname',
            t: 'String',
            size: 128
        },
        {
            n: 'afectStock',
            t: 'String',
            size: 8,
            inList: ['NO', 'RESERVE', 'YES']
        }
        ],
        childs: [{
            n: 'purchases',
            t: 'Purchase'
        }]

    },

    /**Payments */
    MonetaryAccount: {
        ps: [{
            n: 'pname',
            t: 'String',
            size: 128
        }],
        childs: [{
            n: 'paymentOuts',
            t: 'PaymentOut',
            onRelation: 'outAccount'

        },
        {
            n: 'paymentIns',
            t: 'PaymentIn',
            onRelation: 'inAccount'

        },
        {
            n: 'paymentOutForms',
            t: 'PaymentOutForm',

        },
        {
            n: 'paymentInForms',
            t: 'PaymentInForm'

        }
        ]

    },

    PaymentOutType: {
        ps: [{
            n: 'pname',
            t: 'String',
            size: 128
        }]
    },

    PaymentInType: {
        ps: [{
            n: 'pname',
            t: 'String',
            size: 128
        }]
    },

    PaymentOutForm: {
        parents: [{
            n: 'monetaryAccount',
            t: 'MonetaryAccount'
        },
        {
            n: 'paymentOutType',
            t: 'PaymentOutType'
        },

        ],
    },

    PaymentInForm: {
        parents: [{
            n: 'monetaryAccount',
            t: 'MonetaryAccount'
        },
        {
            n: 'paymentInType',
            t: 'PaymentInType'
        },

        ],
    },


    PaymentOut: {
        ps: [{
            n: 'quantity',
            t: 'BigDecimal',
            inZtat: ['avg', 'sum'],
            initJsVal: 0
            , cssClass: 'number'
        }],
        parents: [

            {
                n: 'paymentOutForm',
                t: 'PaymentOutForm'
            },
            {
                n: 'purchase',
                t: 'Purchase'
            },
            {
                n: 'outAccount',
                t: 'MonetaryAccount'
            }
        ],
        psFormulaaa: [{
            n: 'total',//askQuantity * price
            t: 'BigDecimal',

            fn0: [
                { v: 'quantity', t: 'val' },
                { v: '*', t: 's' },
                { v: '1.0', t: 's' }
            ],


            fn: "item0_invoiceLineIn['askQuantity']*item0_invoiceLineIn['price']"
            , cssClass: 'currency'
        }]

    },
    PaymentIn: {
        ps: [{
            n: 'quantity',
            t: 'BigDecimal'
        }],
        parents: [{
            n: 'paymentInForm',
            t: 'PaymentInForm'
        },
        {
            n: 'sale',
            t: 'Sale'
        },
        {
            n: 'inAccount',
            t: 'MonetaryAccount'
        }
        ]

    },

    /**End Payments */

    Purchase: {
        ps: [{
            n: 'pname',
            t: 'String',
            size: 128
        },
        {
            n: 'createdDate',
            t: 'LocalDateTime',
            defaultVal: 'now()',
            setBySys: "now"
        },
        {
            n: 'documentDate',
            t: 'LocalDateTime',
            nullable: true
        },
        {
            n: 'supplyDate',
            t: 'LocalDateTime',
            nullable: true
        },
        {
            n: 'folio',
            t: 'String'
        },
        {
            n: 'status',
            t: 'String',
            inList: ['PENDENT', 'SUPPLIED', 'CANCEL']
        },
        ],

        parents: [{
            n: 'purchaseContract',
            t: 'PurchaseContract',
            tmplOnAcParent: ['thirdPerson_name', 'departamentBaseTimePeriod_pkey']
        },
        {
            n: 'userAutor',
            t: 'UserLon',
            setBySys: "putCurrentUser"
        },
        {
            n: 'purchaseType',
            t: 'PurchaseType',
            onForm: "getAll"

        },
        ],

        childs: [{
            n: 'invoiceLines',
            t: 'InvoiceLineIn'
        },
        {
            n: 'payments',
            t: 'PaymentOut' //            ,
            // onRelation: 'comercialDocument'
        }

        ],

    },
    Sale: {
        ps: [{
            n: 'pname',
            t: 'String',
            size: 128
        },
        {
            n: 'createdDate',
            t: 'LocalDateTime',
            defaultVal: 'now()',
            setBySys: "now"
        },
        {
            n: 'documentDate',
            t: 'LocalDateTime',
            nullable: true
        },
        {
            n: 'supplyDate',
            t: 'LocalDateTime',
            nullable: true
        },
        {
            n: 'folio',
            t: 'String'
        },
        {
            n: 'status',
            t: 'String',
            inList: ['PENDENT', 'SUPPLIED', 'CANCEL']
        },
        ],

        parents: [{
            n: 'saleContract',
            t: 'SaleContract'
        },
        {
            n: 'userAutor',
            t: 'UserLon',
            setBySys: "putCurrentUser"
        },
        {
            n: 'saleType',
            t: 'SaleType',
            onForm: "getAll",

        },
        ],

        childs: [{
            n: 'invoiceLines',
            t: 'InvoiceLineOut'
        },
        {
            n: 'payments',
            t: 'PaymentIn' //            ,
            // onRelation: 'comercialDocument'
        }
        ]
    },


    ProductType: {
        ps: [{
            n: 'pname',
            t: 'String',
            size: 128
        },
        {
            n: 'description',
            t: 'String',
            size: 256,
            nullable: true
        },
        {
            n: 'fastKey',
            t: 'String',
            nullable: true,
            withIndex: true
        },

        {
            n: 'taxable',
            t: 'Boolean',
            defaultVal: true
        },
        {
            n: 'afectStock',
            t: 'Boolean',
            defaultVal: true
        },
        {
            n: 'isService',
            t: 'Boolean',
            defaultVal: false
        },

        {
            n: 'withSerialNumber',
            t: 'Boolean',
            defaultVal: false
        }
        ],
        childs: [{
            n: 'products',
            t: 'Product'
        }]

    },


    StockRack: {
        ps: [{
            n: 'pname',
            t: 'String',
            size: 128
        },
        {
            n: 'fastKey',
            t: 'String',
            nullable: true,
            withIndex: true
        }
        ],
        parents: [{
            n: 'workSpace',
            t: 'WorkSpace'
        }],
        childs: [{
            n: 'stockRackProducts',
            t: 'StockRackProduct'
        },]
    },
    StockRackProduct: {
        ps: [{
            n: 'pname',
            t: 'String',
            size: 128
        },
        {
            n: 'quantity',
            t: 'Long',
            nullable: false,
            defaultVal: 0
        },
        {
            n: 'serialNumber',
            t: 'String',
            nullable: true
        }
        ],
        parents: [{
            n: 'stockRack',
            t: 'StockRack'
        },
        {
            n: 'product',
            t: 'Product'
        }
        ],
        childs: [{
            n: 'InvoiceLineIns',
            t: 'InvoiceLineIn'
        },
        {
            n: 'InvoiceLineOuts',
            t: 'InvoiceLineOut'
        }
        ],
        parentsRestrict: ['stockRack', 'product']

    },
    Product: {
        ps: [{
            n: 'pname',
            t: 'String',
            size: 128
        },
        {
            n: 'description',
            t: 'String',
            size: 256,
            nullable: true
        },
        {
            n: 'fastKey',
            t: 'String',
            nullable: true,
            withIndex: true
        },
        {
            n: 'sku',
            t: 'String',
            nullable: true,
            withIndex: true
        },
        {
            n: 'price',
            t: 'BigDecimal',
        },
        {
            n: 'taxPorcent',
            t: 'BigDecimal',
            min: 0,
            max: 80
        },


        ],
        parents: [{
            n: 'productType',
            t: 'ProductType'
        }],
        childs: [{
            n: 'invoiceLineIns',
            t: 'InvoiceLineIn'
        },
        {
            n: 'invoiceLineOuts',
            t: 'InvoiceLineOut'
        }
        ]

    },

    InvoiceLineIn: {
        ps: [{
            n: 'orden',
            t: 'Integer',
            defaultVal: 1,
            initJsVal: 1
        },
        {
            n: 'price',
            t: 'BigDecimal',
            inZtat: ['avg'],
            initJsVal: 0,
            cssClass: 'currency',
            jsFmt: 'formatPrice'
        },
        {
            n: 'askQuantity',
            t: 'BigDecimal',
            inZtat: ['avg', 'sum'],
            initJsVal: 0
            , cssClass: 'number'
        },
        {
            n: 'supplyQuantity',
            t: 'BigDecimal',
            inZtat: ['avg', 'sum'],
            initJsVal: 0
            , cssClass: 'number'
        },
        {
            n: 'taxPorcent',
            t: 'BigDecimal',
            min: 0,
            max: 100,
            initJsVal: 0
            , cssClass: 'porcent'
        },
        {
            n: 'descountPorcent',
            t: 'BigDecimal',
            min: 0,
            max: 100,
            inZtat: ['avg'],
            initJsVal: 0,
            cssClass: 'porcent'

        },
        {
            n: 'status',
            t: 'String',
            inList: ['PENDENT', 'SUPPLIED', 'CANCEL'],
            initJsVal: '"SUPPLIED"'
        },
        {
            n: 'createdDate',
            t: 'LocalDateTime',
            defaultVal: 'now()',
            setBySys: "now",
            initJsVal: 'new Date()'
        },
        {
            n: 'askDate',
            t: 'LocalDateTime',
            nullable: true
        },
        {
            n: 'supplyDate',
            t: 'LocalDateTime',
            nullable: true
        },
        ],
        tableCols: [
            'askQuantity', 'price', 'descountUnit',
            'descountTotal', 'subtotal2', 'taxPorcent', 'tax',
            'total'
        ]

        ,
        // psFormula: [
        //     {
        //     n: 'subtotal',//askQuantity * price
        //     t: 'BigDecimal',

        //     fn0: [
        //         { v: 'askQuantity', t: 'val' },
        //         { v: '*', t: 's' },
        //         { v: 'price', t: 'val' }
        //     ],
        //     jsFmt:'formatPrice',
        //     cssClass: 'currency'
        // },
        // {
        //     n: 'descountUnit',
        //     t: 'BigDecimal',
        //     ignoreInSum: true,
        //     jsFmt:'formatPrice',
        //     fn0: [
        //         { v: 'price', t: 'val' },
        //         { v: '*', t: 's' },
        //         { v: 'descountPorcent', t: 'por' },

        //     ]
        //     , cssClass: 'currency'
        // },
        // {
        //     n: 'descountTotal',
        //     t: 'BigDecimal',
        //     jsFmt:'formatPrice',
        //     fn0: [
        //         { v: 'descountUnit', t: 'val' },
        //         { v: '*', t: 's' },
        //         { v: 'askQuantity', t: 'val' }
        //     ],
        //      cssClass: 'currency'
        // },
        // {
        //     n: 'subtotal2',
        //     t: 'BigDecimal',
        //     jsFmt:'formatPrice',

        //     fn0: [
        //         { v: 'subtotal', t: 'val' },
        //         { v: '-', t: 's' },
        //         { v: 'descountTotal', t: 'val' }

        //     ]

        // },
        // {
        //     n: 'tax',
        //     t: 'BigDecimal',
        //     jsFmt:'formatPrice',
        //     fn0: [
        //         { v: 'subtotal2', t: 'val' },
        //         { v: '*', t: 's' },
        //         { v: 'taxPorcent', t: 'por' },
        //     ],            
        //      cssClass: 'currency'
        // },
        // {
        //     n: 'total',
        //     t: 'BigDecimal',
        //     jsFmt:'formatPrice',
        //     fn0: [
        //         { v: 'subtotal2', t: 'val' },
        //         { v: '+', t: 's' },
        //         { v: 'tax', t: 'val' }
        //     ],            
        //      cssClass: 'currency'
        // }
        // ],
        onParents: {
            'product': [
                'price=product.price',
                'descountPorcent=product.descountPorcent',
                'taxPorcent=product.taxPorcent'
            ]
            /*
            
            */


        },

        ignoreInDetailCustom: {
            'pkey': 1,
            'askDate': 1, 'createdDate': 1, 'supplyDate': 1
        },

        parents: [{
            n: 'purchase',
            t: 'Purchase'
        },
        {
            n: 'product',
            t: 'Product',
            onForm: "getAll"
        },
        {
            n: 'stockRackProduct',
            t: 'StockRackProduct',
            dependsOn: ['product']
        }

        ]
    },
    InvoiceLineOut: {
        ps: [{
            n: 'orden',
            t: 'Integer',
            defaultVal: 1
        },
        {
            n: 'price',
            t: 'BigDecimal',
            jsFmt: 'formatPrice'
        },
        {
            n: 'askQuantity',
            t: 'BigDecimal'
        },
        {
            n: 'supplyQuantity',
            t: 'BigDecimal'
        },
        {
            n: 'taxPorcent',
            t: 'BigDecimal',
            min: 0,
            max: 100
        },
        {
            n: 'descountPorcent',
            t: 'BigDecimal',
            min: 0,
            max: 100
        },
        {
            n: 'status',
            t: 'String',
            inList: ['PENDENT', 'SUPPLIED', 'CANCEL']
        },
        {
            n: 'createdDate',
            t: 'LocalDateTime',
            defaultVal: 'now()',
            setBySys: "now"
        },
        {
            n: 'askDate',
            t: 'LocalDateTime',
            nullable: true
        },
        {
            n: 'supplyDate',
            t: 'LocalDateTime',
            nullable: true
        },
        ],
/*

        psFormula: [{
            n: 'subtotal',
            t: 'BigDecimal',
            fn0: [
                { v: 'askQuantity', t: 'val' },
                { v: '*', t: 's' },
                { v: 'price', t: 'val' }
            ]
            , jsFmt: 'formatPrice'
            , cssClass: 'currency',
            fn: "item0_invoiceLineOut['askQuantity']*item0_invoiceLineOut['price']"
        },
        {
            n: 'descount',
            t: 'BigDecimal',
            fn: 'askQuantity*price*(1-(descountPorcent/100))'
        },
        {
            n: 'tax',
            t: 'BigDecimal',

            fn: 'askQuantity*price*(1-(descountPorcent/100))*(taxPorcent/100)'
            , jsFmt: 'formatPrice'
        },
        {
            n: 'total',
            t: 'BigDecimal',
            fn: 'askQuantity*price*(1-(descountPorcent/100))*(1+taxPorcent/100)'
            , jsFmt: 'formatPrice'
        }
        ],
*/
        onParents: {
            'product': [
                'price=product.price',
                'descountPorcent=product.descountPorcent',
                'taxPorcent=product.taxPorcent',
            ]
        },
        parents: [{
            n: 'sale',
            t: 'Sale'
        },
        {
            n: 'product',
            t: 'Product'
        },
        {
            n: 'stockRackProduct',
            t: 'StockRackProduct'
        }
        ]
    },


    Appointment: {
        ps: [{
            n: 'pname',
            t: 'String',
            size: 128
        },
        {
            n: 'weekDay',
            t: 'Integer',
            inList: [0, 1, 2, 3, 4, 5, 6]
        },
        {
            n: 'startHour',
            t: 'Integer',
            min: 0,
            max: 23
        },
        {
            n: 'startMinute',
            t: 'Integer',
            min: 0,
            max: 59
        },
        {
            n: 'endHour',
            t: 'Integer',
            min: 0,
            max: 23
        },
        {
            n: 'endMinute',
            t: 'Integer',
            min: 0,
            max: 59
        }
        ],
        parents: [{
            n: 'purchaseContract',
            t: 'PurchaseContract'
        },
        {
            n: 'workSpace',
            t: 'WorkSpace'
        },
        {
            n: 'departamentJobInstance',
            t: 'DepartamentJobInstance'
        }

        ]
    },

    Account: {

        ps: [{
            n: 'pname',
            t: 'String',
            size: 128
        },
        {
            n: 'description',
            t: 'String',
            size: 512,
            nullable: true
        },
        {
            n: 'type',
            t: 'String',
            inList: ['ACTIVE', 'PASIVE']
        }
        ],

        /*
                parents: [
                    { n: 'parentAccount', t: 'Account' }
                ],
                childs: [
                    { n: 'accounts', t: 'Account' }
                ]
                */
    },

    Airport: {
        ps: [{
            n: 'pname',
            t: 'String',
            size: 128
        }],
        childs: [{
            n: 'inCommingFligths',
            t: 'Fligth',
            onRelation: 'toAirport'
        },
        {
            n: 'outCommingFligths',
            t: 'Fligth',
            onRelation: 'fromAirport'
        }
        ]
    },

    Fligth: {
        ps: [{
            n: 'pname',
            t: 'String',
            size: 128
        }],
        parents: [{
            n: 'fromAirport',
            t: 'Airport'
        },
        {
            n: 'toAirport',
            t: 'Airport'
        },
        {
            n: 'plane',
            t: 'Plane'
        },
        ],
        childs: [{
            n: 'fligthInstances',
            t: 'FligthInstance',
            onRelation: 'theFligth'
        }]
    },
    FligthInstance: {
        ps: [{
            n: 'pname',
            t: 'String',
            size: 128
        },
        {
            n: 'outLocalDateTime',
            t: 'LocalDateTime'
        },
        {
            n: 'inLocalDateTime',
            t: 'LocalDateTime'
        }
        ],
        parents: [{
            n: 'theFligth',
            t: 'Fligth'
        }]
    },
    AirCompany: {
        ps: [{
            n: 'pname',
            t: 'String',
            size: 128
        }],
        childs: [{
            n: 'planes',
            t: 'Plane',
            onRelation: "laCompania"
        }]
    },

    Plane: {
        ps: [{
            n: 'pname',
            t: 'String',
            size: 64
        },
        {
            n: 'plate',
            t: 'String',
            size: 8
        },
        {
            n: 'seats',
            t: 'Integer',
            min: 0
        }
        ],
        parents: [{
            n: 'laCompania',
            t: 'AirCompany'
        }],
        childs: [{
            n: 'fligths',
            t: 'Fligth'
        },]
    },

    MeUsrInterface: {
        inMemory: true,
        ps: [{
            n: 'label',
            t: 'String',
            size: 96
        },
        {
            n: 'level',
            t: 'Integer'
        },
        {
            n: 'dc',
            t: 'String'
        }
        ]
    },

    FormLon: {
        ps: [{
            n: 'pname',
            t: 'String',
            size: 64
        }],
        childs: [{
            n: 'formLonFields',
            t: 'FormLonField'
        },]
    },

    FormLonField: {
        ps: [{
            n: 'pname',
            t: 'String',
            size: 64
        }],
        parents: [{
            n: 'formLon',
            t: 'FormLon'
        }]
    },

    Alumno: {
        ps: [{
            n: 'pname',
            t: 'String',
            size: 64
        },
        {
            n: 'primer_apellido',
            t: 'String',
            size: 64
        },
        {
            n: 'segundo_apellido',
            t: 'String',
            size: 64
        },
        {
            n: 'activo',
            t: 'Boolean',
        }

        ],
        childs: [{
            n: 'calificaciones',
            t: 'Calificacion'
        }]
    },
    Materia: {
        ps: [{
            n: 'pname',
            t: 'String',
            size: 64
        },
        {
            n: 'activo',
            t: 'Boolean',

        }
        ],
        childs: [{
            n: 'calificaciones',
            t: 'Calificacion'
        }]
    },
    Calificacion: {
        ps: [{
            n: 'calificacion',
            t: 'BigDecimal',
            min: 0,
            max: 10
        },
        {
            n: 'fecha',
            t: 'LocalDate'
        }
        ],
        parents: [{
            n: 'alumno',
            t: 'Alumno'
        },
        {
            n: 'materia',
            t: 'Materia'
        },
        ]
    }


}


const condiciones = {
    roots: ['Base', 'Departament', 'Program'],
    memberships: ['DepartamentUserLon', 'ProgramUserLon', 'BaseUserLon'],
    operators: ['DepartamentBaseTimePeriod', 'ProgramBaseTimePeriod'],
    ownSA: [' DepartamentJobInstance', 'ContractOut', 'ContractIn', 'StockRack', 'StockRackProduct', 'Appointment']
}

putInvoiceItemsProperties('InvoiceLineIn',model)
putInvoiceItemsProperties('InvoiceLineOut',model)





exports.model = model
exports.modeloCondiciones = condiciones
