$("document").ready(() => {
  console.log("Ready profile");
  loadPosts();
})

function loadPosts() {
  $.get("/api/posts", {postedBy: profileUserId, replyTo: null}, results => {
    outputPosts(results, $(".postsContainer"));
})
}