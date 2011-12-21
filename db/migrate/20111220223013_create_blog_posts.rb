class CreateBlogPosts < ActiveRecord::Migration
  def change
    create_table :blog_posts do |t|
      t.string :title
      t.text :content
      t.references :blog

      t.timestamps
    end
    add_index :blog_posts, :blog_id
  end
end
