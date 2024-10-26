document.addEventListener("DOMContentLoaded", async () => {
  const apiUrl = "json/extended_payload.json";
  const chatBox = document.getElementById("chat-box");
  const roomName = document.getElementById("room-name");
  const roomImage = document.getElementById("room-img");
  const participants = document.getElementById("participant");
  const chatsContainer = document.querySelector(".chats");
  const emptyConversation = document.getElementById("empty-conversation");
  const conversation = document.getElementById("conversation");
  const backButton = document.getElementById("back-button");
  const chatListDiv = document.querySelector(".chat-list-div");
  const sidebar = document.getElementById("sidebar");

  let selectedChat = null;

  emptyConversation.style.display = "flex";
  conversation.style.display = "none";

  const showConversation = () => {
    emptyConversation.style.display = "none";
    conversation.style.display = "block";
  };

  const showEmptyConversation = () => {
    emptyConversation.style.display = "flex";
    conversation.style.display = "none";
  };

  const showChatList = () => {
    emptyConversation.style.display = "none";
    conversation.style.display = "none";
    chatListDiv.style.display = "block";
    sidebar.style.display = "block";
  };

  const showMobileChatList = () => {
    if (!selectedChat) {
      showChatList();
    } else {
      showConversation();
    }
  };

  const getParticipantName = (senderId, participants) => {
    const participant = participants.find(
      (participant) => participant.id === senderId
    );
    return participant ? participant.name : "Unknown Participant";
  };

  const fetchData = async () => {
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      return data.results;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleResize = () => {
    if (window.innerWidth <= 768) {
      if (selectedChat) {
        showConversation();
        chatListDiv.style.display = "none";
        sidebar.style.display = "none";
      } else {
        showMobileChatList();
      }
    } else {
      chatListDiv.style.display = "block";
      sidebar.style.display = "block";
      if (!selectedChat) {
        showEmptyConversation();
      } else {
        showConversation();
      }
    }
  };

  window.addEventListener("resize", handleResize);
  handleResize(); // Initial check on load

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (window.innerWidth <= 768) {
        showChatList();
      } else {
        showEmptyConversation();
      }
      selectedChat = null;
    }
  });

  backButton.addEventListener("click", () => {
    showChatList();
    selectedChat = null;
  });

  const renderChatList = (data) => {
    chatsContainer.innerHTML = "";

    data.forEach((chatData) => {
      const { room, comments } = chatData;
      const lastMessage = comments[comments.length - 1];
      const unreadCount = comments.filter((comment) => !comment.read).length;

      const chatItem = document.createElement("div");
      chatItem.classList.add(
        "chat-item",
        "d-flex",
        "justify-content-between",
        "align-items-center",
        "p-2",
        "p-3",
        "border-bottom"
      );

      const profileImage = document.createElement("img");
      profileImage.src = room.image_url || "static/images/pp.jpeg";
      profileImage.alt = "Profile";
      profileImage.classList.add("img-fluid", "rounded-3", "me-3");
      profileImage.style.width = "50px";
      profileImage.style.height = "50px";

      const chatInfo = document.createElement("div");
      chatInfo.classList.add("flex-grow-1");

      const chatHeader = document.createElement("div");
      chatHeader.classList.add("d-flex", "justify-content-between");

      const chatTitle = document.createElement("strong");
      chatTitle.classList.add("room-name");
      chatTitle.textContent = room.name;

      const chatTime = document.createElement("small");
      chatTime.classList.add("text-muted");
      chatTime.textContent = lastMessage
        ? new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        : "";

      chatHeader.appendChild(chatTitle);
      chatHeader.appendChild(chatTime);

      const chatBody = document.createElement("div");
      chatBody.classList.add("d-flex", "justify-content-between");

      const lastMessageText = document.createElement("p");
      lastMessageText.classList.add("mb-0", "text-muted", "last-message");
      lastMessageText.textContent = lastMessage
        ? lastMessage.message
        : "No messages yet";

      const unreadBadge = document.createElement("span");
      unreadBadge.classList.add(
        "badge",
        "bg-success",
        "rounded-pill",
        "px-2",
        "py-1"
      );
      unreadBadge.textContent = unreadCount;
      if (unreadCount === 0) unreadBadge.style.display = "none";

      chatBody.appendChild(lastMessageText);
      chatBody.appendChild(unreadBadge);

      chatInfo.appendChild(chatHeader);
      chatInfo.appendChild(chatBody);

      chatItem.appendChild(profileImage);
      chatItem.appendChild(chatInfo);
      chatsContainer.appendChild(chatItem);

      chatItem.addEventListener("click", () => {
        selectedChat = chatData;
        renderChat([chatData]);
        showConversation();

        if (window.innerWidth <= 768) {
          chatListDiv.style.display = "none";
          sidebar.style.display = "none";
        }
      });
    });
  };

  const renderChat = (data) => {
    const { room, comments } = data[0];
    roomName.classList.add("conversation-name");
    roomName.textContent = room.name;

    roomImage.src = room.image_url || "static/images/pp.jpeg";

    participants.innerHTML = "";
    if (room.participant.length === 2) {
      // Change participant info to "Online" with green color
      const onlineStatus = document.createElement("span");
      onlineStatus.textContent = "Online";
      onlineStatus.style.color = "green";
      participants.appendChild(onlineStatus);
    } else {
      // Display participant names as before
      room.participant.forEach((participant, index) => {
        const participantSpan = document.createElement("span");
        participantSpan.textContent = participant.name;
        participants.appendChild(participantSpan);
        if (index !== room.participant.length - 1) {
          participants.appendChild(document.createTextNode(", "));
        }
      });
    }

    chatBox.innerHTML = "";
    comments.forEach((comment) => {
      const messageBox = document.createElement("div");
      messageBox.classList.add("message-box");

      const senderName = getParticipantName(comment.sender, room.participant);
      if (comment.sender === "customer@mail.com") {
        messageBox.classList.add("my-message");
      } else {
        messageBox.classList.add("friend-message");
      }

      if (comment.type === "text") {
        const textContent = document.createElement("p");
        textContent.innerHTML = `<span style="text-align: left">${senderName}</span> ${
          comment.message
        }<br /><span style="text-align: 'end'>${new Date().toLocaleTimeString(
          [],
          { hour: "2-digit", minute: "2-digit" }
        )}</span>`;
        messageBox.appendChild(textContent);
      } else if (comment.type === "video") {
        const videoContent = document.createElement("div");
        videoContent.classList.add("attachment-box");
        videoContent.innerHTML = `
          <p><strong><span>${senderName}</span></strong></p>
          <video controls style="max-width: 400px;">
            <source src="${comment.url}" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <p><span>${new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}</span></p>
        `;
        messageBox.appendChild(videoContent);
      } else if (comment.type === "image") {
        const imageContent = document.createElement("div");
        imageContent.classList.add("attachment-box");
        imageContent.innerHTML = `
          <p><strong><span>${senderName}</span></strong></p>
          <img src="${comment.url}" alt="Image" style="max-width: 400px;" />
          <p><span>${new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}</span></p>
        `;
        messageBox.appendChild(imageContent);
      } else if (comment.type === "pdf") {
        const pdfContent = document.createElement("div");
        pdfContent.classList.add("attachment-box");
        pdfContent.innerHTML = `
          <p><strong><span>${senderName}</span></strong></p>
          <iframe src="${
            comment.url
          }" style="max-width: 400px; width: 100%; height: 400px;" frameborder="0"></iframe>
          <p><span>${new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}</span></p>
        `;
        messageBox.appendChild(pdfContent);
      } else if (comment.type === "audio") {
        const audioContent = document.createElement("div");
        audioContent.classList.add("attachment-box");
        audioContent.innerHTML = `
          <p><strong><span>${senderName}</span></strong></p>
          <audio controls style="max-width: 400px;">
            <source src="${comment.url}" type="audio/mpeg" />
            Your browser does not support the audio tag.
          </audio>
          <p><span>${new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}</span></p>
        `;
        messageBox.appendChild(audioContent);
      }

      chatBox.appendChild(messageBox);
    });
  };

  const data = await fetchData();
  if (data) {
    renderChatList(data);
  }
});
