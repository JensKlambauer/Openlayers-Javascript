import { GetRequest } from "./AjaxRequest";

export default class GitHubRepos {   

    handleRepoList(user, repos) {
        const userRepos = JSON.parse(repos)    
        // Handle each individual user repo here
        console.log(userRepos)
    }

    async list() {
        const userGet = `https://api.github.com/search/users?page=1&q=jensklambauer&type=Users`;    
        const users = await GetRequest(userGet);
        console.log(users)
        const usersList = JSON.parse(users).items;    
        usersList.forEach(async (user) => {
            const repos = await GetRequest(user.repos_url);  
            this.handleRepoList(user, repos)
        })
    }
}
