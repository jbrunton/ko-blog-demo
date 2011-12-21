class BlogPost < ActiveRecord::Base
    belongs_to :blog
    
    def self.search(pattern)
        BlogPost.where("title like ?", pattern)
    end
end
