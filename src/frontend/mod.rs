use crate::{list::Item, db::{get_list_items, get_lists_names}};

/**
 * Private
 */
fn build_item_list(
  id: &String, 
  list: &String,
  items: Vec<Item>
) -> String {
  items.iter()
    .map(|item| {
      format!("<div class='item'><a href='/{}/list/{}/item/{}'>{}</a></div>" ,
        id,
        list,
        item.id,
        item.title
    )
    })
    .collect()
    
}

fn build_lists(id: &String, lists: Vec<String>) -> String {
  lists.iter()
    .map(|list| {
      format!("<div class='item'><a href='/{}/list/{}'>{}</a></div>" ,
        id, 
        list,
        list
      )
    })
    .collect()
}

fn build_styles() -> String {
  "<style>
    html {
      background-color: black;
      text-align: center;
      color: white;
    }

    a:-webkit-any-link {
      color: white;
      text-decoration: none;
    }

    item {

    }
  </style>".to_string()
}

fn build_head(title: &String) -> String {
  format!("<head><title>{}</title>{}<meta charset=\"UTF-8\"></head>", 
    title, 
    build_styles()
  )
}

/**
 * Public
 */
pub fn build_list_page(
  id: &String,
  list: &String
) -> String {
  let mut response: String = build_head(&list);

  response += &format!("<h1>{}</h1>", list);

  let items = get_list_items(&id, &list);
  if items.is_none() {
    response.push_str("Empty list");
  } else {
    response.push_str(build_item_list(
      id, 
      list,
      items.unwrap()
    ).as_str());
  }

  response
}

pub fn build_lists_page(
  id:&String
) -> String {
  let mut response: String = build_head(&"Lists".to_string());

  response.push_str(
    &build_lists(
      id, 
      get_lists_names(&id)
    )
  );
  response
}