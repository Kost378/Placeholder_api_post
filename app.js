let btnAddTask = document.querySelector("input[type = 'submit']")



let temp = document.querySelector("#task_temp");
let title = temp.content.querySelector("h2");
let desc = temp.content.querySelector("p");



let themes = {
  light: {  
    "--background-body": "#f0f0f0",
    "--background-section": "#e5e5e5",
    "--text-color": "rgb(77, 77, 77)",
    "--background-description": "#ffffff",
    "--background-submit": "rgb(76, 118, 227)",
    "--background-del": "rgb(223, 89, 89)",
    "--selection-color": "rgb(150, 150, 150)",
    },
  dark: {
    "--background-body": "rgb(16, 20, 34)",
    "--background-section": "rgb(27, 35, 59)",
    "--text-color": "#000",
    "--background-description": "rgb(81, 89, 112)",
    "--background-submit": "rgb(29, 61, 119)",
    "--background-del": "rgb(120, 38, 38)",
    "--selection-color": "rgb(190, 190, 190)",
  },
}
let themeSelect = document.querySelector("#theme");
let lastSelectedTheme = localStorage.getItem("lastSelectedTheme") || 'light';

  if (lastSelectedTheme !== "light"){
    setTheme(lastSelectedTheme);
    themeSelect.value = lastSelectedTheme;
  }

  themeSelect.addEventListener("change", onThemeSelectHandler);


  function onThemeSelectHandler(e){
    const selectedTheme = themeSelect.value;
    let isConfirmed = confirm(`Вы действительно хотите изменить тему на ${selectedTheme}`);
    if (!isConfirmed) {
      themeSelect.value = lastSelectedTheme;
      return;
    }
  
    setTheme(selectedTheme);
  }
  function setTheme(name){
    const selectedThemObj = themes[name];
    Object.entries(selectedThemObj).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
    localStorage.setItem('lastSelectedTheme', name);
  }

/*btnAddTask.addEventListener('click', function(){
  event.preventDefault();

})
*/


function addEventDel(btn){
  btn.addEventListener("click", function deletTask(){
    let task = this.closest(".task");
    let isConfirmed = confirm("Вы действительно хотите удалить задачу?")
    if(isConfirmed)
    task.style.display = "none";


  })
}
function insertManyTask(arrOfTasks, i){
  let b = i + 20;
  for (;i < b; i++){
    insertTask(arrOfTasks[i]);
  }
/*arrOfTasks.forEach((item) => {
  insertTask(item)
  })*/
}


function insertTask(obj = {title:'', body: '', id : 1}){
  title.textContent = obj.title;
  title.textContent += "  " + obj.id;
  desc.textContent = obj.body;
  let clone = document.importNode(temp.content, true);

  document.body.appendChild(clone);
  addEventDel(document.body.lastElementChild.querySelector("button"));

  getPostsComment(obj.id)
  .then(comments => {
    insertComments(comments,obj.id);

  })
  .catch(err => console.log(err));
}


function insertComments(obj, id){
  let fragment = document.createDocumentFragment();
  let sectionCom = document.createElement("div");
  sectionCom.classList.add('comment');
  let details = document.createElement("details");
  let summary = document.createElement("summary");
  summary.textContent = "Комментарии";
  summary.style = "text-align: justify;";

  let p = document.createElement("p");
  let h = document.createElement("h3");
  p.innerHTML = obj[0].body;
  h.innerHTML = obj[0].name;
  summary.appendChild(document.createElement("hr"));
  summary.appendChild(h);
  summary.appendChild(p);
  
  details.appendChild(summary);
  details.appendChild(document.createElement("hr"));
  for (let i = 1; i < obj.length; i++){
    let p = document.createElement("p");
    let h = document.createElement("h3");
    p.innerHTML = obj[i].body;
    h.innerHTML = obj[i].name;

    details.appendChild(h);
    details.appendChild(p);
    details.appendChild(document.createElement("hr"));
  }
  sectionCom.appendChild(details);
  fragment.appendChild(sectionCom);
  window.requestAnimationFrame(() => {
    document.querySelectorAll(".task")[id-1].appendChild(sectionCom);
  })
 
  //document.body.appendChild(sectionCom);

}


let ticking = false;

document.addEventListener('scroll', scrollEvent);

function scrollEvent() {
  let allTask = document.body.querySelectorAll('.task');
  let last = allTask[allTask.length - 1];
  if (!ticking && (window.scrollY >= last.offsetTop - window.innerHeight * 2)) {
    window.requestAnimationFrame(function() {
      if(allTask.length == 100){
        ticking = true;
        return
      }
      insertManyTask(posts_g, allTask.length);
      
      
      ticking = false;
    });

    ticking = true;
  }
}

function httpRequest(url, outErrRes){
  try {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.addEventListener('load', () => {
      if(Math.floor(xhr.status / 100) !==2) {
        outErrRes(`Error, Status code ${xhr.status}`, xhr);
        return;
      }
      const response = JSON.parse(xhr.responseText);
      outErrRes(null, response);
    });

    xhr.addEventListener('error', () => outErrRes(`Error, Status code: ${xhr.status}`, xhr));

    xhr.send();
  } catch (error) {
    outErrRes(error);
  }
}



function getPosts(){
  return new Promise((resolve, reject) => {
    httpRequest("https://jsonplaceholder.typicode.com/posts", (error, response) => {
      if(error){
        reject(error);
      }
      resolve(response);
    })

  });
}

function getPostsComment(id){
  return new Promise((resolve, reject) => {
    httpRequest(`https://jsonplaceholder.typicode.com/comments?postId=${id}`, (error, response) => {
      if(error){
        reject(error);
      }
      resolve(response);
    })
  });
}

function getUserCreatedPost(){
  return new Promise((resolve, reject) => {
    httpRequest("https://jsonplaceholder.typicode.com/users/1", (error, response) => {
      if(error){
        reject(error);
      }
      resolve(response);
    })
  });
}
let posts_g;
getPosts()
  .then(posts => {
    insertManyTask(posts, 0);
    posts_g = posts;
  })

  .catch(err => console.log(err));


  