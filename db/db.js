require('dotenv').config()

module.exports.insertOrUpdate = (knex,tableName,objectArray,{ hasGen = false, replaceColumns = null, relations = null, ignoreColumns = [] } = {}) => {
    
    return objectArray.map(async (entry) => {
        
        if(ignoreColumns.length > 0)
            for(const ignoreColumn of ignoreColumns){
                if(!entry.hasOwnProperty(ignoreColumn))
                    continue;
                delete entry[ignoreColumn]
            }   

        if(replaceColumns)
            for(const [oldColumn,newColumn] of Object.entries(replaceColumns)){
                if(!entry.hasOwnProperty(oldColumn))
                    continue;
                entry[newColumn] = entry[oldColumn];
                delete entry[oldColumn]
            }
        
        if(relations){
            for(const [column,{ table, refColumn }] of Object.entries(relations))
            {
                if(!entry.hasOwnProperty(column))
                    continue;
                let row = null;
                if(hasGen)
                    row = await knex(table).where({ [refColumn]: entry[column], gen: entry.gen }).first(['id'])
                else
                    row = await knex(refTable).where({ [refColumn]: entry[column] }).first(['id'])
                entry[column] = row ? row.id : null;
            }
            //console.log(entry)
        }    

        try{
            const row = await knex(tableName).where(hasGen ? { name: entry.name, gen: entry.gen } : { name: entry.name }).first(['id']);
            if(row && row.id){
                await knex(tableName)
                .update(entry)
                .where('id',row.id)
                return {tableName, INSERTED: 0, UPDATED: 1}
                
            }else{
    
                await knex(tableName).insert(entry)
                                    
                return {tableName, INSERTED: 1, UPDATED: 0}      
            
            }
        }catch(e){
            throw new Error(e)
        }
    })
}

module.exports.resultRecords = (table,results) => results.reduce((acc,{INSERTED, UPDATED}) =>{
    acc['INSERTED'] += INSERTED
    acc['UPDATED'] += UPDATED
    return acc;
},{table,INSERTED: 0,UPDATED: 0})

module.exports.knex = require('knex')({
    client: 'mysql',
    connection: {
        host : process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        charset  : 'utf8mb4'
    }
});

