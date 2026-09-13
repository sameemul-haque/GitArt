export async function githubJoinDate() {
  const username = prompt("Enter your GitHub username:");
  if (!username) {
    return;
  }

  try {
    const response = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}`
    );
    if (!response.ok) {
      alert(
        response.status === 404
          ? "No GitHub user found with that username."
          : "Could not fetch the data. Please try again later."
      );
      return;
    }
    const userData = await response.json();
    const options = { year: "numeric", month: "long", day: "numeric" };
    const joinDate = new Date(userData.created_at).toLocaleDateString("en", options);
    alert("Your GitHub join date is: " + joinDate);
  } catch (error) {
    alert("An error occurred while fetching the data. Please try again later.");
  }
}
