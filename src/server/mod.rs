use warp::Filter;
use crate::frontend::{build_list_page, build_lists_page};

pub async fn setup_server() {
  let home = warp::get()
    .map(|| String::from("Hello and welcome to outof"));
    
  let lists = warp::path::param()
    .and(warp::path("lists"))
    .map(|id: String| {
      build_lists_page(&id)
    })
    .with(warp::reply::with::header("Content-Type", "text/html"));

  let list = warp::path::param()
    .and(warp::path("list"))
    .and(warp::path::param())
    .map(|id: String, list: String| build_list_page(&id, &list.replace("%20", " ")))
    .with(warp::reply::with::header("Content-Type", "text/html"));

  let routes = warp::get()
    .and(
      lists
      .or(list)
      .or(home)
    );

  println!("Starting server...");
  warp::serve(routes)
    .run(([127, 0, 0, 1], 8888))
    .await;
}