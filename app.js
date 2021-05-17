const BASE_URL = "https://jsonplace-univclone.herokuapp.com";
const STATE = {
  users: fetchUsers(),
  albums: null,
  posts: null,
  postComments: null,
};

function fetchUsers() {
  fetchData(`${BASE_URL}/users`).then(function (data) {
    STATE.users = data;
    renderUserList(data);
  });
}

function fetchUserAlbumList(userId) {
  return fetchData(
    `${BASE_URL}/users/${userId}/albums?_expand=user&_embed=photos`
  ).then((data) => (STATE.albums = data));
}

function fetchData(url) {
  return fetch(url)
    .then(function (response) {
      return response.json();
    })
    .catch(function (error) {
      console.log(error);
    });
}

function fetchUserPosts(userId) {
  return fetchData(`${BASE_URL}/users/${userId}/posts?_expand=user`).then(
    (data) => (STATE.posts = data)
  );
}

function fetchPostComments(postId) {
  return fetchData(`${BASE_URL}/users/${postId}/comments`).then(
    (data) => (STATE.postComments = data)
  );
}

// setter function
function setCommentsOnPost(post) {
  if (post.comments) {
    return Promise.reject(null);
  }
  return fetchPostComments(post.id).then(function (comments) {
    post.comments = comments;
    return post;
  });
}

//render functions
function renderUser(user) {
  const userObj = `
    <div class="user-card" data-user= ${user.id}>
    <header>
    <h2>${user.name}</h2>
    </header>
    <section class="company-info">
    <p><b>Contact:</b> ${user.email}</p>
    <p><b>Works for:</b> ${user.company.name}</p>
    <p><b>Company creed:</b> ${user.company.catchPhrase}</p>
    </section>
    <footer>
    <button class="load-posts">POSTS BY ${user.username} </button>
    <button class="load-albums">ALBUMS BY ${user.username} </button>
    </footer>
    </div>
    `;
  return userObj;
}

function renderUserList(userList) {
  const userListObj = $("#user-list");
  userListObj.empty();
  userList.forEach(function (user) {
    const userObj = renderUser(user);
    userListObj.append(userObj);
  });
}

function renderAlbum(album) {
  const albumObj = $(`
    <div class="album-card">
  <header>
    <h3>quidem molestiae enim, by ${album.user.username} </h3>
  </header>
  <section class="photo-list">
    <!-- ... -->
  </section>
    </div>
    `);
  album.photos.forEach(function (photo) {
    const photoObj = renderPhoto(photo);
    $(".photo-list").append(photoObj);
  });
  return albumObj;
}

function renderPhoto(photo) {
  const photoObj = $(`<div class="photo-card">
    <a href="${photo.url}" target="_blank">
      <img src="${photo.thumbnailUrl}">
      <figure>accusamus beatae ad facilis cum similique qui sunt</figure>
    </a>
  </div>`);
  return photoObj;
}

function renderAlbumList(albumList) {
  $("#app section.active").removeClass("active");

  $("#album-list").addClass("active").empty();
  albumList.forEach(function (album) {
    const albumObj = renderAlbum(album);
    $("#album-list").append(albumObj);
  });
}

function renderPost(post) {
  const postObj = $(`<div class="post-card">
  <header>
    <h3>sunt aut facere repellat provident occaecati excepturi optio reprehenderit</h3>
    <h3>--- ${post.username}</h3>
  </header>
  <p>${post.body}</p>
  <footer>
    <div class="comment-list"></div>
    <a href="#" class="toggle-comments">(<span class="verb">show</span> comments)</a>
  </footer>
</div>`);
  postObj.data("post", post);
  return postObj;
}

function renderPostList(postList) {
  $("#app section.active").removeClass("active");
  $("#post-list").addClass("active").empty();
  postList.forEach(function (post) {
    const postObj = renderPost(post);
    $("#post-list").append(postObj);
  });
}

//user interactions

$("#user-list").on("click", ".user-card .load-posts", function () {
  const userObj = $(this).closest("[data-user]");
  const userData = userObj.data("user");
  fetchUserPosts(userData).then(renderPostList);
});

$("#user-list").on("click", ".user-card .load-albums", function () {
  const userObj = $(this).closest("[data-user]");
  const userData = userObj.data("user");
  fetchUserAlbumList(userData).then(renderAlbumList);
});

function toggleComments(postCardElement) {
  const footerElement = postCardElement.find("footer");

  if (footerElement.hasClass("comments-open")) {
    footerElement.removeClass("comments-open");
    footerElement.find(".verb").text("show");
  } else {
    footerElement.addClass("comments-open");
    footerElement.find(".verb").text("hide");
  }
}

$("#post-list").on("click", ".post-card .toggle-comments", function () {
  const postCardElement = $(this).closest(".post-card");
  const post = postCardElement.data("post");
  setCommentsOnPost(post)
    .then(function (post) {
      const commentList = $(postCardElement.find(".comment-list"));
      commentList.empty();
      post.comments.forEach(function (comment) {
        const postObj = $(`<h3>${comment.body}${comment.email}</h3>`);
        commentList.append(postObj);
      });
      toggleComments(postCardElement);
    })
    .catch(function () {
      toggleComments(postCardElement);
    });
});
