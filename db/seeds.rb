# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ :name => 'Chicago' }, { :name => 'Copenhagen' }])
#   Mayor.create(:name => 'Emanuel', :city => cities.first)

users = User.create([
    { :user_name => 'jbrunton' },
    { :user_name => 'irene' }
])

user_jbrunton = users[0]
user_irene = users[1]

blogs = Blog.create([
    { :title => 'My Blog',      :user => user_jbrunton },
    { :title => "Irene's Blog", :user => user_irene }
])

blog_jbrunton = blogs[0]
blog_irene = blogs[1]

blogPosts = BlogPost.create([
    { :blog => blog_jbrunton,   :title => 'Some Post',      :content => '<p>Some content</p>' },
    { :blog => blog_jbrunton,   :title => 'Another Post',   :content => '<p>Some content</p>' },
    { :blog => blog_irene,      :title => "Irene's Post",   :content => '<p>Some content</p>' }
])
