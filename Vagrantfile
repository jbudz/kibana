Vagrant.configure("2") do |config|
  config.vm.synced_folder '.', '/vagrant', disabled: true

  config.vm.define "tar" do |tar|
    tar.vm.box = 'generic/ubuntu2004'
  end

  config.vm.define "deb" do |deb|
    deb.vm.box = 'generic/debian9'
  end

  config.vm.define "rpm" do |rpm|
    rpm.vm.box = 'generic/rhel8'
    rpm.playbook = "test/package/rpm/tasks.yml"
  end

  config.vm.define "docker" do |docker|
    docker.vm.box = 'generic/centos/8'
  end
end