{
    CLI: {
        on make migration: [
            add boilerplate migration,
            add schema
        ],
        reframe make module: [
            controller,
            service
        ]
    },
    add validator: [
        nullable,
        enum:opts1,opts2,

        min,
        max,
        length,

        exist:column,table,
        unique:column,table,except,

        extnames:docs,txt,
        maxsize:2mb
    ]
}