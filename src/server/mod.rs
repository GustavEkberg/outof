use std::str::FromStr;

use http::Uri;
use warp::Filter;

use crate::{
  frontend::{
    build_list_page, 
    build_lists_page
  }, 
  db::delete_item
};

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

  let delete = warp::path::param()
    .and(warp::path("list"))
    .and(warp::path::param())
    .and(warp::path("item"))
    .and(warp::path::param())
    .map(|
      chat_id: String, 
      list_name: String, 
      item_id: String
    | {
      delete_item(
        &chat_id, 
        &list_name.replace("%20"," "),
        &item_id
      );
      warp::redirect(Uri::from_str(
        &format!("/{}/list/{}",
          chat_id,
          list_name
        ).as_str())
        .unwrap()
      )
    });

  let routes = warp::get()
    .and(
      lists
      .or(delete)
      .or(list)
      .or(home)
    );

  println!("Starting server...");
  warp::serve(routes)
    .run(([127, 0, 0, 1], 8888))
    .await;
}