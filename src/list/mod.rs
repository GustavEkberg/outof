pub mod list_item {
  use serde::{Serialize, Deserialize};
  use crate::db::db_list::{get_items, create_items};

  #[derive(Serialize,Deserialize,Debug)]
  pub struct Item {
    pub id: String,
    pub title: String,
    pub created: i64,
    pub user: String
  }

  pub fn list_command() {
    let items: Vec<Item> = get_items();
    items.iter()
      .for_each(|i| println!("{:#?}", i));
  }

  pub fn create_command(items: Vec<Item>) {
    create_items(items) 
  }

  pub fn generate_command() {
    println!("Generate list to frontend")
  }
}