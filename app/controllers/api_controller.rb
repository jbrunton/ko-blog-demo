class ApiController < ApplicationController

    def getModel(name)
        {
            "user" => User,
            "blog" => Blog,
            "blog-post" => BlogPost
        }[name]
    end
    
    def feed
        model = getModel(params[:model])
        
        if params[:search_text]
            pattern = "%#{params[:search_text]}%"
            response = model.search(pattern)
        else
            response = model.feed(params)
        end
        
        respond_to do |format|
            format.json { render :json => response }
        end
    end
    
    def create
        # model = getModel(params[:model])
        
        logger.info "create - params: #{params}"
        
        post = BlogPost.create(blog_id: params[:blog_id], :title => params[:title], :content => params[:content])
        
        respond_to do |format|
            if post.save
                format.json { render :json => post, :status => :ok }
            else
                format.json { render :json => post.errors,
                        :status => :unprocessable_entity }
            end
        end
    end
    
    def update
        logger.info "update - params: #{params}"

        model = getModel(params[:model])
        
        @object = model.find(params[:id])
        
        logger.info "@object: #{@object}"
        
        respond_to do |format|
            if @object.update_attributes(params[:data])
                logger.info "success"
                sleep 1
                format.json  { render :json => @object, :status => :ok }
            else
                logger.info "errors: #{object.errors}"
                format.json  { render :json => @object.errors,
                        :status => :unprocessable_entity }
            end
        end
    end
    
    def delete
        model = getModel(params[:model])
        
        obj = model.find(params[:id])
        
        respond_to do |format|
            if obj.destroy
                format.json  { render :json => {}, :status => :ok }
            else
                format.json  { render :json => obj.errors,
                        :status => :unprocessable_entity }
            end
        end
    end    
end
