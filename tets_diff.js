/**
 * @author ii02735
 * @description Script to check differences between the submodule and the repo's
 */

const octokit = require("@octokit/rest")
const Octokit = new octokit.Octokit({
    auth: '95459f99ffef24780336e4e953bd5f28c2369256'
});

/**
 * Retrieved from api.github.com/repos/GeoDaz/api-pokemon-showdown/workflows
 */

const WORKFLOW_ID = 4194906;

(async function (){

    try{

        const submodule_data = await Octokit.repos.getContent({
            owner: "ii02735",
            repo: "test_submodule",
            path: "test_submodule_module"
        })

        const repository_master = await Octokit.repos.getCommit({
            owner: "ii02735",
            repo: "test_submodule_module",
            ref: "main"
        })
        
        const submodule_sha_1 = submodule_data.data.sha
        const repository_sha_1 = repository_master.data.sha

        console.log(`Update requested at ${Date()}`)
        // if(submodule_sha_1 == repository_sha_1)
        // {
        //     Octokit.actions.createWorkflowDispatch({
        //         owner: "ii02735",
        //         repo: "test_submodule",
        //         ref: "main",
        //         workflow_id: WORKFLOW_ID
        //     }).then((response) => {
        //         if(response.status == 204)
        //             console.log(`Update requested at ${Date}`)
        //     })
        // }

    }catch(e){
        console.log(e)
    }
})()

