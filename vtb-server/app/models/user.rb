class User < ActiveRecord::Base

    def self.search(pattern)
        User.where("user_name like ?", pattern)
    end

end
