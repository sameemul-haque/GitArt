import express from 'express';
import { Octokit } from 'octokit';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const port = 3000;

const octokit = new Octokit({
    auth: process.env.GITHUB_AUTH_TOKEN
});

app.use(express.json());
app.use(cors()); 
app.post('/workflow', async (req, res) => {
    
    const { username, github_token, repo_name, github_commit_mail, gitart_commit_command } = req.body;

    try {
        await octokit.request('POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches', {
            owner: "sameemul-haque",
            repo: "test",
            workflow_id: 'gitart.yml',
            ref: 'main',
            inputs: {
                username,
                github_token,
                repo_name,
                github_commit_mail,
                gitart_commit_command
            },
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });
        res.status(200).send('Workflow request sent successfully');
    } catch (error) {
        console.error('Error sending workflow request:', error);
        res.status(500).send('Internal server error');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
