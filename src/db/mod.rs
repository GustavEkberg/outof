use chrono::Utc;
use uuid::Uuid;
use crate::list::{Item, Chat, generate_list_name};
use std::fs::{
  write, 
  read_to_string, 
  create_dir, 
  read_dir, 
  remove_file
};
use std::io::ErrorKind;
use std::path::{PathBuf, Path};

const DATA_FOLDER: &'static str = "./src/data/";

/**
 * Private
 */
fn init_user_files(chat_id: &String) {
  create_dir(DATA_FOLDER).unwrap_or_else(|error| {
    match error.kind() {
      ErrorKind::AlreadyExists => (),
      _ => panic!("Create data folder panic! {:#?}", error)
    }
  });

  create_dir(
    &format!("{}/{}", DATA_FOLDER, chat_id)
  ).unwrap_or_else(|error| {
    match error.kind() {
      ErrorKind::AlreadyExists => (),
      _ => panic!("Create user data folder panic! {:#?}", error)
    }
  });

  create_dir(
    &format!("{}/{}/lists", DATA_FOLDER, chat_id)
  ).unwrap_or_else(|error| {
    match error.kind() {
      ErrorKind::AlreadyExists => (),
      _ => panic!("Create user list folder panic! {:#?}", error)
    }
  });
    

  write(
    &format!("{}/{}/items.json", DATA_FOLDER, chat_id)
  , "[]"
  ).unwrap();
}

fn read_file_all_list_items(chat_id: &String) -> Vec<Item> {
  serde_json::from_str(
    read_to_string(
      &format!("{}/{}/items.json", DATA_FOLDER, chat_id)
    ).unwrap()
    .as_str()
  ).unwrap()
}

fn read_file_list_items(
  chat_id: &String, 
  list_name: &String
) -> Option<Vec<Item>> {
  if !Path::new(
    &list_name_to_file(
      chat_id, 
      list_name
    )
  ).exists() {
    None
  } else {
    Some(
      serde_json::from_str(
        read_to_string(
          list_name_to_file(
            chat_id, 
            list_name
          )
        ).unwrap()
        .as_str()
      ).unwrap()
    )
  }
}

fn write_string_to_file(
  file: &Path,
  items: &String
) {
  write(file, items).unwrap();
}

fn parse_items(
  string: &String, 
  user: &String
) -> Vec<Item> {
  string.split(",")
    .into_iter()
    .map(|item| Item {
      id: Uuid::new_v4().to_string(), 
      title: item.trim().to_string(),
      user: user.to_string(),
      created: Utc::now().timestamp()
    })
    .collect()
}

fn remove_list_file(
  chat_id: &String,
  list_name: &String
) {
  remove_file(
    list_name_to_file(
      chat_id, 
      list_name
    )
  ).unwrap();
}

/**
 * Public 
 */
pub fn get_all_items(chat_id: &String) -> String {
  let mut items: String = String::new();

  for item in read_file_all_list_items(chat_id) {
    items += &item.to_chat_message()
  };
  items
}

pub fn get_list_items(
  chat_id: &String, 
  list: &String
) -> Option<Vec<Item>> {
  read_file_list_items(chat_id, &list.replace(" ", "_"))
}

pub fn create_items(
  chat_id: &String,
  items: &String, 
  user: &String
) {

  if !Path::new(&format!("{}/{}/", DATA_FOLDER, chat_id)).exists() {
    init_user_files(chat_id)
  }

  let mut list = read_file_all_list_items(chat_id);
  for item in parse_items(items, user) {
    if item.title.len() > 0 {
      list.push(item);
    };
  }

  write_string_to_file(
    Path::new(&format!("{}{}/items.json", DATA_FOLDER, chat_id)),
    &serde_json::to_string(&list).unwrap()
  );
}

pub fn delete_item(
  chat_id: &String, 
  list_name: &String,
  item_id: &String,

) {
  let list: Vec<Item> = read_file_all_list_items(chat_id)
    .into_iter()
    .filter(|i| !i.id.eq(item_id))
    .collect();

  write_string_to_file(
    Path::new(&format!("{}/{}/items.json", DATA_FOLDER, chat_id)),
    &serde_json::to_string(&list).unwrap()
  );

  let list: Vec<Item> = read_file_list_items(chat_id, list_name)
    .unwrap()
    .into_iter()
    .filter(|i| !i.id.eq(item_id))
    .collect();

  if list.len() == 0 {
    remove_list_file(
      chat_id,
      list_name
    )
  } else {
    write_string_to_file(
      Path::new(&list_name_to_file(
        chat_id, 
        list_name
      )),
      &serde_json::to_string(&list).unwrap()
    );
  }
}

pub fn create_new_list(chat_id: &String) -> String {
  let list_name = generate_list_name();
  write_string_to_file(
    Path::new(&list_name_to_file(
      chat_id, 
      &list_name
    )),
    &serde_json::to_string(
      &read_file_all_list_items(chat_id)
    ).unwrap()
  );

  format!("[{}]({}{}/{})", 
    list_name,
    std::env::var("DOMAIN").unwrap_or_else(
      |_| "http://localhost:8888/".to_string(),
    ),
    chat_id,
    list_name
  )
}

pub fn get_lists_names(chat_id: &String) -> Vec<String>{
 read_dir(format!("{}/{}/lists/",
      DATA_FOLDER,
      chat_id,
    )).unwrap()
    .into_iter()
    .map(|entry| file_to_list_name(&entry
        .unwrap()
        .path())
      .unwrap())
    .collect::<Vec<String>>()
}

pub fn list_name_to_file(
  chat_id: &String,
  name: &String
) -> String { // TODO: Return Path
  format!("{}{}/lists/{}.json",
    DATA_FOLDER,
    chat_id,
    name.replace(" ", "_")
  )
}

pub fn file_to_list_name(file: &PathBuf) -> Option<String> {
  if !file.is_file() {
    None
  } else {
    Some(file.file_name()
      .unwrap()
      .to_str()
      .unwrap()
      .to_string()
      .replace(".json", "")
      .replace("_", " ")
    )
  }
}
