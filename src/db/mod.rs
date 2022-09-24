
pub mod db_list {
  use crate::list::list_item::Item;
  use std::{fs::{write, read_to_string}, io::ErrorKind};

  const LIST_FILE: &'static str = "./src/data/list.json";

  /**
   * Private
   */
  fn init_list_file() {
    write(LIST_FILE, "[]").unwrap();
  }

  fn read_file_list_items() -> Vec<Item> {
    serde_json::from_str(
      match read_to_string(LIST_FILE) {
        Ok(result) => result,
        Err(error) => match error.kind() {
          ErrorKind::NotFound => {
            init_list_file();
            "[]".to_string()
          },
          _ => panic!("Read list file panic {}", error)
        }
      }.as_str()
    ).unwrap()
  }

  fn write_string_to_file(items: String) {
    write(LIST_FILE, items).unwrap();
  }
  
  /**
   * Public 
   */
  pub fn get_items() -> Vec<Item> {
    read_file_list_items()
  }

  pub fn create_items(items: Vec<Item>) {
    let mut list = read_file_list_items();
    for item in items {
      list.push(item);
    }
    write_string_to_file(serde_json::to_string(&list).unwrap());
  }

  pub fn delete_item(id: String) {
  }

}