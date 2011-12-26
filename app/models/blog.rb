class Blog < ActiveRecord::Base
    belongs_to :user
    
    def self.search(pattern)
        Blog.where("title like ?", pattern)
    end
    
    def self.feed(params)
        id = params[:id]
        if id == "all"
            Blog.all.collect {
                |b| {
                    :id => b.id,
                    :title => b.title,
                    :author => b.user.user_name }}
        else
            blog = Blog.find(id)
            user = User.find(blog.user_id)
            posts = BlogPost.where("blog_id = ?", id).order("created_at DESC")
            
            {   :id => blog.id,
                :title => blog.title,
                :author => user.user_name,
                :posts => posts }
        end
    end
end
