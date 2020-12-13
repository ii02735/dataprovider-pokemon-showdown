#!/usr/bin/env node

/**
 * @author ii02735
 * @description Script to check differences between the submodule and the repo's
 */

const octokit = require("@octokit/rest")
const Octokit = new octokit.Octokit({
    auth: process.env.PERSONAL_TOKEN
});
const fs = require('fs')

/**
 * ID fetched from api.github.com/repos/ii02735/api-pokemon-showdown/actions/workflows
 */

const WORKFLOW_ID = 4229835
const repository_owner = 'ii02735'
const repository_name = 'api-pokemon-showdown';

(async function (){

    try{
        // Retrieve pokemon-showdown directory content
        const submodule = await Octokit.repos.getContent({
            owner: repository_owner,
            repo: repository_name,
            path: "pokemon-showdown"
        })
        // Retrieve latest commit of pokemon-showdown repository
        const repository_master = await Octokit.repos.getCommit({
            owner: "smogon",
            repo: "pokemon-showdown",
            ref: "master"
        })
        
        const submodule_sha_1 = submodule.data.sha
        const repository_sha_1 = repository_master.data.sha

        if(submodule_sha_1 != repository_sha_1)
        {
            Octokit.actions.createWorkflowDispatch({
                owner: repository_owner,
                repo: repository_name,
                workflow_id: WORKFLOW_ID,
                ref: 'main'
            }).then((response) => {
                if(response.status == 204)
                    fs.appendFileSync('execution.log',`Update requested at ${Date()}\n`)
                else
                    fs.appendFileSync('execution.log',`Update requested failed with code ${response.status} at ${Date()}\n`)
            })
        }else{
            fs.appendFileSync('execution.log',`Checking done without update request at ${Date()}\n`)
        }

    }catch(e){
        fs.appendFileSync('execution.log',`Error at ${Date()}\n${e.stack}\n`)
    }
})()

