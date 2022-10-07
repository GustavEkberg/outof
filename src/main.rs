use server::setup_server;
use telegram::setup_bot;

mod db;
mod frontend;
mod list;
mod server;
mod telegram;

#[tokio::main]
async fn main() {
    tokio::spawn(setup_server());
    setup_bot().await;
}
