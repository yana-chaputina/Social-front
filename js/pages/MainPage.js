// TODO: remove code duplication
export default class MainPage {
    constructor(context) {
        this._context = context;
        this._rootEl = context.rootEl();
        this._firstPostId = 0;
        this._lastPost = 0;
        this._postsCount = 5;
    }

    init() {
        this._rootEl.innerHTML = `
      <div class="container">
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
          <a class="navbar-brand" href="#">Network</a>
          <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbar-supported-content">
            <span class="navbar-toggler-icon"></span>
          </button>

          <div class="collapse navbar-collapse" id="navbar-supported-content">
            <ul class="navbar-nav mr-auto">
              <li class="nav-item active">
                <a class="nav-link" data-id="menu-main" href="/">NewsFeed</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" data-id="menu-messages" href="/messages">Messages</a>
              </li>
            </ul>
            <form data-id="search-form" class="form-inline my-2 my-lg-0">
              <input class="form-control mr-sm-2" type="search" placeholder="Search">
              <button class="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
            </form>
          </div>
        </nav>
        <div class="row">
            <div class="col">
              <div class="card">
                <div class="card-body">
                  <form data-id="post-edit-form">
                    <input type="hidden" data-id="id-input" value="0">
                    <div class="form-group">
                      <label for="content-input">Content</label>
                      <input type="text" data-id="content-input" class="form-control" id="content-input">
                    </div>
                    <div class="form-group">
                      <div class="custom-file">
                        <input type="hidden" data-id="media-name-input">
                        <input type="file" data-id="media-input" class="custom-file-input" id="media-input">
                        <label class="custom-file-label" for="media-input">Choose file</label>
                      </div>
                    </div>
                    <button type="submit" class="btn btn-primary">Submit</button>
                  </form>                             
                </div>
                </div>
                <div class="row" data-id="new-posts">
                </div>
                <div class="row" data-id="posts-container">
                </div>              
            </div>
            </div>
        </div>
        
      </div>
      <div class="modal fade" data-id="error-modal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLabel">Error!</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div data-id="error-message" class="modal-body">
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    `;

        this._rootEl.querySelector('[data-id=menu-main]').addEventListener('click', evt => {
            evt.preventDefault();
        });
        this._rootEl.querySelector('[data-id=menu-messages]').addEventListener('click', evt => {
            evt.preventDefault();
            this._context.route(evt.currentTarget.getAttribute('href'));
        });

        this._errorModal = $('[data-id=error-modal]'); // jquery
        this._errorMessageEl = this._rootEl.querySelector('[data-id=error-message]');
        this._newPostsEl = this._rootEl.querySelector('[data-id=new-posts]');
        this._postsContainerEl = this._rootEl.querySelector('[data-id=posts-container]');
        this._postCreateFormEl = this._rootEl.querySelector('[data-id=post-edit-form]');
        this._idInputEl = this._postCreateFormEl.querySelector('[data-id=id-input]');
        this._contentInputEl = this._postCreateFormEl.querySelector('[data-id=content-input]');
        this._mediaNameInputEl = this._postCreateFormEl.querySelector('[data-id=media-name-input]');
        this._mediaInputEl = this._postCreateFormEl.querySelector('[data-id=media-input]');

        this._mediaInputEl.addEventListener('change', evt => {
            // evt.currentTarget -> тот, чей обработчик события сейчас выполняется
            // File -> Blob
            const [file] = Array.from(evt.currentTarget.files);
            // FormData -> сам выставит нужные заголовки и закодирует тело запроса
            const formData = new FormData();
            formData.append('file', file);
            this._context.post('/files/multipart', formData, {},
                text => {
                    const data = JSON.parse(text);
                    this._mediaNameInputEl.value = data.name;
                },
                error => {
                    this.showError(error);
                });
        });
        this._postCreateFormEl.addEventListener('submit', evt => {
            evt.preventDefault();
            const data = {
                id: Number(this._idInputEl.value),
                content: this._contentInputEl.value,
                media: this._mediaNameInputEl.value || null
            };
            this._context.post('/posts', JSON.stringify(data), {'Content-Type': 'application/json'},
                text => {
                    this._idInputEl.value = 0;
                    this._contentInputEl.value = '';
                    this._mediaNameInputEl.value = '';
                    this._mediaInputEl.value = '';
                    this.clean();
                    this._lastPost++;
                    this.loadMorePosts(0, this._lastPost);
                    this.getFirstPost();
                },
                error => {
                    this.showError(error);
                });
        });
        this.loadMorePosts(this._lastPost, this._postsCount);
        this._lastPost += this._postsCount;
        this.getFirstPost();

        this.pollNewPosts();
    }

    getFirstPost() {
        this._context.get("/posts", {},
            text => {
                const id = JSON.parse(text);
                this._firstPostId = id;
            },
            error => {
                this.showError(error);
            });
    }

    clean() {
        this._postsContainerEl.innerHTML = ``;
    }

    loadMorePosts(lastPost, step) {
        const str = "?last=" + lastPost + "&step=" + step;
        this._context.get("/posts" + str, {},
            text => {
                const posts = JSON.parse(text);
                this.loadNewList(posts);
            },
            error => {
                this.showError(error);
            });
    }

    loadNewList(posts) {
        if (!posts) {
            return;
        }
        for (const post of posts) {
            const postEl = document.createElement('div');
            postEl.className = 'col-4';
            let postMedia = '';
            if (post.media !== null) {
                if (post.media.endsWith('.png') || post.media.endsWith('.jpg')) {
                    postMedia += `
            <img src="${this._context.mediaUrl()}/${post.media}" class="card-img-top" alt="...">
          `;
                } else if (post.media.endsWith('.mp4') || post.media.endsWith('.webm')) {
                    postMedia = `
            <div class="card-img-topcard-img-top embed-responsive embed-responsive-16by9 mb-2">
              <video src="${this._context.mediaUrl()}/${post.media}" class="embed-responsive-item" controls>
            </div>
          `;
                } else if (post.media.endsWith('.mp3')) {
                    postMedia = `
            <div class = "card-img-topcard-img-top embed-responsive embed-responsive-16by9 mb-2">
              <audio src = "${item.value}" class = "embed-responsive-item" controls>
            </div>
          `;
                }
            }

            postEl.innerHTML = `
        <div class="card mt-2">
          ${postMedia}
          <div class="card-body">
            <p class="card-text">${post.content}</p>
            <p class="card-text">Likes: ${post.likes}</p>
          </div>
          <div class="card-footer">
            <div class="row">
              <div class="col">
                <a href="#" data-action="like" class="btn btn-sm btn-primary">Like</a>
                <a href="#" data-action="dislike" class="btn btn-sm btn-danger">Dislike</a>
              </div>
              <div class="col text-right">
                <a href="#" data-action="edit" class="btn btn-sm btn-primary">Edit</a>
                <a href="#" data-action="remove" class="btn btn-sm btn-danger">Remove</a>
              </div>
            </div>
          </div>
        </div>
      `;
            postEl.querySelector('[data-action=like]').addEventListener('click', evt => {
                evt.preventDefault();
                this._context.post(`/posts/${post.id}/likes`, null, {},
                    () => {
                        this.clean();
                        this.loadMorePosts(0, this._lastPost);
                    }, error => {
                        this.showError(error);
                    });
            });
            postEl.querySelector('[data-action=dislike]').addEventListener('click', evt => {
                evt.preventDefault();
                this._context.delete(`/posts/${post.id}/likes`, {},
                    () => {
                        this.clean();
                        this.loadMorePosts(0, this._lastPost);
                    }, error => {
                        this.showError(error);
                    });
            });
            postEl.querySelector('[data-action=edit]').addEventListener('click', evt => {
                evt.preventDefault();
                this._idInputEl.value = post.id;
                this._contentInputEl.value = post.content;
                this._mediaNameInputEl.value = post.media;
                this._mediaInputEl.value = '';
            });
            postEl.querySelector('[data-action=remove]').addEventListener('click', evt => {
                evt.preventDefault();
                this._context.delete(`/posts/${post.id}`, {},
                    () => {
                        this.clean();
                        this._lastPost--;
                        this.loadMorePosts(0, this._lastPost);
                    }, error => {
                        this.showError(error);
                    });
            });
            this._postsContainerEl.appendChild(postEl);
        }
        if (posts) {
            const loadPostEl = document.createElement('div');
            loadPostEl.className = 'col-4';
            loadPostEl.innerHTML = `
    <div class="card mt-2">
    <div class="card-body">
              <div class="col text-center">
                <a href="#" data-action="upload-posts" class="btn btn-sm btn-primary">Upload more posts</a>
              </div>
              </div>
        </div>`;
            loadPostEl.querySelector('[data-action=upload-posts]').addEventListener('click', evt => {
                evt.preventDefault();
                this._postsContainerEl.removeChild(loadPostEl);
                this.loadMorePosts(this._lastPost, this._postsCount);
                this._lastPost += this._postsCount;
            });
            this._postsContainerEl.appendChild(loadPostEl);
        }
    }

    pollNewPosts() {
        this._timeout = setTimeout(() => {
            if (!this._created) {
                this.newPostsDetected();
            }
            this.pollNewPosts();
        }, 5000);
    }

    newPostsDetected() {
        const str = "?first=" + this._firstPostId;
        this._context.get("/posts" + str, {},
            text => {
                const count = JSON.parse(text);
                if (count > 0) {
                    this.newPostsAnnotation(count);
                }
            },
            error => {
                this.showError(error);
            });
    }

    newPostsAnnotation(count) {
        this._newPostsEl.innerHTML = '';
        const newPostEl = document.createElement('div');
        newPostEl.className = 'col-4';
        newPostEl.innerHTML = `
    <div class="card mt-2">
    <div class="card-body">
              <div class="col text-center">
                <a href="#" data-action="new-posts" class="btn btn-sm btn-primary">Upload ${count} new posts</a>
              </div>
              </div>
        </div>`;
        newPostEl.querySelector('[data-action=new-posts]').addEventListener('click', evt => {
            evt.preventDefault();
            this._newPostsEl.removeChild(newPostEl);
            this.clean();
            this._lastPost += count;
            this.loadMorePosts(0, this._lastPost);
            this.getFirstPost();
        });
        this._newPostsEl.appendChild(newPostEl);
    }

    showError(error) {
        const data = JSON.parse(error);
        const message = this._context.translate(data.message);
        this._errorMessageEl.textContent = message;
        this._errorModal.modal('show');
    }

    destroy() {
        clearTimeout(this._timeout);
    }
}
