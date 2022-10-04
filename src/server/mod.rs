use warp::Filter;
use crate::db::{get_lists_names, get_list_items};

pub async fn setup_server() {
  let lists = warp::path::param()
    .and(warp::path("lists"))
    .map(|id: String| {
      get_lists_names(&id)
        .join("\n")
    });

  let list = warp::path::param()
    .and(warp::path("list"))
    .and(warp::path::param())
    .map(|id: String, list: String| get_list_items(&id, &list));

  let routes = warp::get()
    .and(
      lists
        .or(list)
    );

  println!("Starting server...");
  warp::serve(routes)
    .run(([127, 0, 0, 1], 8888))
    .await;
}