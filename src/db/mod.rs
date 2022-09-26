
pub mod db_list {
  use chrono::Utc;
  use uuid::Uuid;
  use crate::list::list_item::{Item, Chat};
  use std::fs::{write, read_to_string, create_dir};
  use std::io::ErrorKind;

  const DATA_FOLDER: &'static str = "./src/data/";
  const OUTOF_FILE: &'static str = "./src/data/outOfItems.json";

  /**
   * Private
   */
  fn init_file(file: &str, init_value: &str) {
    create_dir(DATA_FOLDER).unwrap_or_else(|error| {
      match error.kind() {
        ErrorKind::AlreadyExists => (),
        _ => panic!("Create data folder panic! {:#?}", error)
      }
    });
      
    write(file, init_value).unwrap();
  }

  fn read_file_list_items() -> Vec<Item> {
    serde_json::from_str(
      read_to_string(OUTOF_FILE).unwrap_or_else(|error| {
        match error.kind() {
          ErrorKind::NotFound => {
            init_file(OUTOF_FILE, "[]");
            "[]".to_string()
          },
          _ => panic!("Read list file panic! {:#?}", error)
        }
      }).as_str()
    ).unwrap()
  }

  fn write_string_to_file(items: String) {
    write(OUTOF_FILE, items).unwrap();
  }

  fn parse_items(string: &String, user: String) -> Vec<Item> {
    string.split(",")
      .into_iter()
      .map(|item| Item {
        id: Uuid::new_v4().to_string(), 
        title: item.to_string(),
        user: user.to_string(),
        created: Utc::now().timestamp()
      })
      .collect()
  }
  
  /**
   * Public 
   */
  pub fn get_items() -> String {
    let mut items: String = String::new();

    for item in read_file_list_items() {
      items += &item.to_chat_message()
    };
    items
  }

  pub fn create_items(items: &String, user: String) {
    let mut list = read_file_list_items();
    for item in parse_items(items, user) {
      list.push(item);
    }
    write_string_to_file(serde_json::to_string(&list).unwrap());
  }

  pub fn _delete_item(id: String) {
    let list: Vec<Item> = read_file_list_items()
      .into_iter()
      .filter(|i| !i.id.eq(&id))
      .collect();
    write_string_to_file(serde_json::to_string(&list).unwrap());
  }

}