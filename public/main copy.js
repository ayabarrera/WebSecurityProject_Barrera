fetch("/profile")
  .then((res) => res.json())
  .then((data) => {
  document.getElementById("profile").innerHTML = `
  <img src="${data.profile}" alt="Profile Picture" class="profile-img">
  <div class="profile-details">
    <p>Adventurer: ${data.username}</p>
    <p>Level: ${data.level}</p>  
    <p>XP: ${data.xp} / 1000</p>
    <p>🏅 Badges: ${data.badges.join(", ")}</p>
  </div>
`;
  });


fetch("/quests")
  .then((res) => res.json())
  .then((data) => {
    const list = document.getElementById("quest-list");
    data.forEach((quest) => {
      const item = document.createElement("li");
      item.textContent = `✔️ ${quest.title} (+${quest.xp} XP)`;
      list.appendChild(item);
    });
  });

fetch("/guilds")
  .then((res) => res.json())
  .then((data) => {
    const list = document.getElementById("guild-list");
    data.forEach((guild) => {
      const item = document.createElement("li");
      item.textContent = `🏰 ${guild.name}`;
      list.appendChild(item);
    });
  });
