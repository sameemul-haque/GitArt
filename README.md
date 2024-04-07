# GitArt

> [!IMPORTANT]  
> If you're reading this, it means you like this project :). Feel free to give it a star ⭐.

GitArt is a tool that allows users to manipulate their GitHub contribution graph by generating Git commit commands. With this tool, users can customize their contribution graph to display their name, messages, symbols, logos, or any other desired patterns.

## Features

- Generate Git commit commands with custom dates, times, and messages.
- Easily create Git commits to modify the contribution graph on GitHub.
- Customize the contribution graph for artistic, personal, or branding purposes.

## Usage

- Select the year you want to customize (Choosing the year before your GitHub joining year would be better, can use GitHub api for checking the joined date).
- Select your timezone. (I dont know if this is important or not)
- Select the desired rectangle(s) on the GitHub contribution graph that you want to customize.
- Use the GitArt website to specify the details of your Git commit, such as the date, time, and message.
- Copy the generated Git commit command.
- Run the copied command in your local Git repository to make the desired changes.
- Push the changes to your GitHub repository to update the contribution graph.

To create an empty commit with a specific date:
```bash
git commit --allow-empty --date="31 Oct 2022 11:11:11 +0530" --allow-empty-message -m ""
```


