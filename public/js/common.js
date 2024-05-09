$("#postTextarea, #replyTextarea").keyup(event => {
  var textbox = $(event.target);
  var value = textbox.val().trim();

  let isModal = textbox.parents(".modal").length == 1;

  var submitButton = isModal ? $("#submitReplyButton") : $("#submitPostButton");

  if(submitButton.length == 0) return alert("No submit button found");

  if (value == "") {
      submitButton.prop("disabled", true);
      return;
  }

  submitButton.prop("disabled", false);
})

$("#submitPostButton, #submitReplyButton").click(() => {
  let button = $(event.target);

  let isModal = button.parents(".modal").length == 1;
  let textbox = isModal ? $("#replyTextarea") : $("#postTextarea");

  let data = {
    content: textbox.val()
  };

  if(isModal) {
    let id = button.data().id;
    if(!id) return alert("Id is null");
    data.replyTo = id;
  }

    $.post("/api/posts", data, (postData) => {
        if(postData.replyTo) {
            location.reload();
        }

        const html = createPostHtml(postData);
        $(".postsContainer").prepend(html);
        textbox.val();
        button.prop("disabled", true);
      })
  
})

$("#replyModal").on("show.bs.modal", (event) => {
    var button = $(event.relatedTarget);
    var postId = getPostIdFromElement(button);
    $("#submitReplyButton").data("id", postId);

    $.get("/api/posts/" + postId, results => {
        outputPosts(results.postData, $("#originalPostContainer"));
    })
})

$("#replyModal").on("hidden.bs.modal", (event) => {
    $("#originalPostContainer").html("");
    $("#replyTextarea").val("");
})

$("#deletePostModal").on("show.bs.modal", (event) => {
    var button = $(event.relatedTarget);
    var postId = getPostIdFromElement(button);
    $("#deletePostButton").data("id", postId);
});

$("#deletePostButton").on("click", (event) => {
    let id = $(event.target).data("id");
    if(!id) return;

    $.ajax({
        url: `/api/posts/${id}`,
        type: "DELETE",
        success: () => {
            location.reload()
        }
    })
})

$(document).on("click", ".likeButton", () => {
    let button = $(event.target);
    let postId = getPostIdFromElement(button);

    if(!postId) return;
    $.ajax({
        url: `/api/posts/${postId}/like`,
        type: "PUT",
        success: (postData) => {
            button.find("span").text(postData.likes.length || '');

            if(postData.likes.includes(userLoggedIn._id)) {
                button.addClass("active");
            }
            else {
                button.removeClass("active");
            }
        }
    })
})

$(document).on("click", ".retweetButton", () => {
    let button = $(event.target);
    let postId = getPostIdFromElement(button);

    if(!postId) return;
    $.ajax({
        url: `/api/posts/${postId}/retweet`,
        type: "POST",
        success: (postData) => {
            button.find("span").text(postData.retweetUsers.length || '');

            if(postData.retweetUsers.includes(userLoggedIn._id)) {
                button.addClass("active");
            }
            else {
                button.removeClass("active");
            }
        }
    })
})

$(document).on("click", ".post", () => {
    let element = $(event.target);
    let postId = getPostIdFromElement(element);

    if(!postId) return;

    if(!element.is("button")) 
        window.location.href = `/posts/${postId}`;
})

function getPostIdFromElement(element) {
    let isRoot = element.hasClass("post");
    let rootElement = isRoot ? element : element.closest(".post");
    let postId = rootElement.data().id;

    if(!postId) alert("Something went wrong");

    return postId;
}

function createPostHtml(postData, largeFont = false) {

  if(!postData) {
    return alert("post object is null");
  }

  const retweetData = postData.retweetData;

  let retweetedBy = retweetData ? postData.postedBy.username : null;
  postData = retweetData ? retweetData : postData;
    
  let postedBy = postData.postedBy;
  let displayName = postedBy.firstName + " " + postedBy.lastName;
  let timestamp = timeDifference(new Date(), new Date(postData.createdAt));

  let likeButtonActiveClass = postData.likes.includes(userLoggedIn._id) ? "active" : "";
  let retweetButtonActiveClass = postData.retweetUsers.includes(userLoggedIn._id) ? "active" : "";

  let largeFontClass = largeFont ? "largeFont" : "";

  let retweetText = '';

  if(retweetData) {
    retweetText = `<span> <i class='fas fa-retweet'></i> Retweeted by <a href='/profile/${retweetedBy}'> @${retweetedBy} </a> </span>`;
  }

  var replyFlag = "";
    if(postData.replyTo) {
        
        if(!postData.replyTo._id) {
            return alert("Reply to is not populated");
        }
        else if(!postData.replyTo.postedBy._id) {
            return alert("Posted by is not populated");
        }

        var replyToUsername = postData.replyTo.postedBy.username;
        replyFlag = `<div class='replyFlag'>
                        Replying to <a href='/profile/${replyToUsername}'>@${replyToUsername}<a>
                    </div>`;

    }

    var buttons = "";
    if (postData.postedBy._id == userLoggedIn._id) {
        buttons = `<button data-id="${postData._id}" data-toggle="modal" data-target="#deletePostModal"><i class='fas fa-times'></i></button>`;
    }

    return `<div class='post ${largeFontClass}' data-id='${postData._id}'>
                <div class='postActionContainer'>
                    ${retweetText}
                </div>
                <div class='mainContentContainer'>
                    <div class='userImageContainer'>
                        <img src='${postedBy.profilePic}'>
                    </div>
                    <div class='postContentContainer'>
                        <div class='header'>
                            <a href='/profile/${postedBy.username}' class='displayName'>${displayName}</a>
                            <span class='username'>@${postedBy.username}</span>
                            <span class='date'>${timestamp}</span>
                            ${buttons}
                        </div>
                        ${replyFlag}
                        <div class='postBody'>
                            <span>${postData.content}</span>
                        </div>
                        <div class='postFooter'>
                            <div class='postButtonContainer'>
                                <button data-toggle='modal' data-target='#replyModal'>
                                    <i class='far fa-comment'></i>
                                </button>
                            </div>
                            <div class='postButtonContainer green'>
                                <button class='retweetButton ${retweetButtonActiveClass}'>
                                    <i class='fas fa-retweet'></i>
                                    <span>${postData.retweetUsers.length || ""}</span>
                                </button>
                            </div>
                            <div class='postButtonContainer red'>
                                <button class='likeButton ${likeButtonActiveClass}'>
                                    <i class='far fa-heart'></i>
                                    <span>${postData.likes.length || ""}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
}

function timeDifference(current, previous) {

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
        if(elapsed/1000 < 30) return "Just now"
         return Math.round(elapsed/1000) + ' seconds ago';   
    }

    else if (elapsed <= msPerHour) {
         return Math.round(elapsed/msPerMinute) + ' minutes ago';   
    }

    else if (elapsed <= msPerDay ) {
         return Math.round(elapsed/msPerHour ) + ' hours ago';   
    }

    else if (elapsed <= msPerMonth) {
        return Math.round(elapsed/msPerDay) + ' days ago';   
    }

    else if (elapsed <= msPerYear) {
        return Math.round(elapsed/msPerMonth) + ' months ago';   
    }

    else {
        return Math.round(elapsed/msPerYear ) + ' years ago';   
    }
}

function outputPosts(results, container) {
    container.html("");
    
    if(!Array.isArray(results)) {
        results = [results];
    }
    results.forEach(result => {
        var html = createPostHtml(result)
        container.append(html);
    });
  
    if (results.length == 0) {
        container.append("<span class='noResults'>Nothing to show.</span>")
    }
  }

  function outputPostsWithReplies(results, container) {
    container.html("");

    if(results.replyTo !== undefined && results.replyTo._id !== undefined) {
        var html = createPostHtml(results.replyTo)
        container.append(html);
    }

    var mainPostHtml = createPostHtml(results.postData, true)
    container.append(mainPostHtml);

    results.replies.forEach(result => {
        var html = createPostHtml(result)
        container.append(html);
    });
}