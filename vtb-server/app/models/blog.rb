class Blog < ActiveRecord::Base
    belongs_to :user
    
    def self.search(pattern)
        Blog.where("title like ?", pattern)
    end
end
